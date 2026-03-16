'use server'

import { pool, query } from '@/lib/db.server'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { uploadToS3 } from '@/lib/storage.server'
import type { ShopStatus } from '@/types/shop'
import type { ActionResult } from '@/lib/action-result'
import { checkQuota, consumeQuota } from '@/lib/freemium'
import { checkShopRegDailyLimit, incrementShopRegCount } from '@/lib/daily-limit'

export async function createShop(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  // 認証チェック
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: '認証が必要です' }
  const userId = session.user.id

  // バリデーション
  const name = formData.get('name') as string
  if (!name?.trim()) return { success: false, error: '店名を入力してください' }

  const memo = (formData.get('memo') as string) || null
  // ステータスのバリデーション（未指定またはと不正値は WANT にフォールバック）
  const rawStatus = formData.get('status') as string
  const VALID_STATUSES: ShopStatus[] = ['WANT', 'VISITED', 'FAVORITE']
  const status: ShopStatus = VALID_STATUSES.includes(rawStatus as ShopStatus)
    ? (rawStatus as ShopStatus)
    : 'WANT'
  // VISITED / FAVORITE の場合は登録時点を訪問日時としてセット
  const visitedAt = status === 'VISITED' || status === 'FAVORITE' ? new Date() : null

  const placeId = (formData.get('placeId') as string) || null
  const address = (formData.get('address') as string) || null
  const lat = formData.get('lat') ? parseFloat(formData.get('lat') as string) : null
  const lng = formData.get('lng') ? parseFloat(formData.get('lng') as string) : null
  const tags = formData.getAll('tags[]') as string[]

  // Google検索登録（placeId あり）の場合は月次クォータをチェック
  if (placeId) {
    const canRegister = await checkQuota(userId)
    if (!canRegister) {
      return { success: false, error: 'QUOTA_EXCEEDED' }
    }
  }

  // 日次お店登録制限チェック
  const withinDailyLimit = await checkShopRegDailyLimit(userId)
  if (!withinDailyLimit) {
    return { success: false, error: 'DAILY_SHOP_LIMIT_EXCEEDED' }
  }

  let shopId: string

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // placeId が指定されていれば既存 Shop を再利用、なければ新規作成
    // ON CONFLICT DO NOTHING で race condition を防ぐ。RETURNING id が空の場合は SELECT で取得する
    let currentShopId: string | null = null
    if (placeId) {
      const upsertRows = await client.query<{ id: string }>(
        `INSERT INTO "Shop" (id, name, address, lat, lng, "placeId", source, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, 'google', NOW(), NOW())
         ON CONFLICT ("placeId") DO NOTHING
         RETURNING id`,
        [randomUUID(), name, address, lat, lng, placeId]
      )
      if (upsertRows.rows.length > 0) {
        // 新規作成された場合
        currentShopId = upsertRows.rows[0].id
      } else {
        // 既存レコードが存在した場合（競合）は SELECT で取得
        const existingRows = await client.query<{ id: string }>(
          `SELECT id FROM "Shop" WHERE "placeId" = $1`,
          [placeId]
        )
        currentShopId = existingRows.rows[0].id
      }
    } else {
      // placeId なし（手動登録）は新規作成
      const newShopId = randomUUID()
      await client.query(
        `INSERT INTO "Shop" (id, name, address, lat, lng, "placeId", source, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, 'google', NOW(), NOW())`,
        [newShopId, name, address, lat, lng, placeId]
      )
      currentShopId = newShopId
    }

    // ユーザーとお店を紐づける（選択されたステータスで登録、VISITED/FAVORITE は訪問日時もセット）
    await client.query(
      `INSERT INTO "UserShop" (id, "userId", "shopId", status, memo, "visitedAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4::"ShopStatus", $5, $6, NOW(), NOW())`,
      [randomUUID(), userId, currentShopId, status, memo, visitedAt]
    )

    // タグを upsert して ShopTag を登録（Tag.name に @unique があるため upsert 可能）
    for (const tagName of tags) {
      const tagRows = await client.query<{ id: string }>(
        `INSERT INTO "Tag" (id, name, "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, NOW(), NOW())
         ON CONFLICT (name) DO UPDATE SET "updatedAt" = NOW()
         RETURNING id`,
        [tagName]
      )
      const tagId = tagRows.rows[0].id
      await client.query(
        `INSERT INTO "ShopTag" (id, "shopId", "tagId", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())
         ON CONFLICT ("shopId","tagId") DO NOTHING`,
        [currentShopId, tagId]
      )
    }

    await client.query('COMMIT')
    shopId = currentShopId
  } catch {
    await client.query('ROLLBACK')
    return { success: false, error: '登録に失敗しました' }
  } finally {
    client.release()
  }

  // Google検索登録の場合はクォータを消費する（transaction外）
  if (placeId) {
    await consumeQuota(userId)
  }

  // 登録成功後に日次お店登録カウントを消費（transaction外）
  await incrementShopRegCount(userId)

  // 写真を S3 にアップロードし、公開 URL を DB に保存（トランザクション外で実行）
  const photos = formData.getAll('photos') as File[]
  if (photos.length > 0) {
    for (const photo of photos) {
      if (photo.size > 0) {
        const imageUrl = await uploadToS3(photo)
        await query(
          `INSERT INTO "ShopPhoto" (id, "shopId", "userId", "imageUrl", "createdAt")
           VALUES (gen_random_uuid(), $1, $2, $3, NOW())`,
          [shopId, userId, imageUrl]
        )
      }
    }
  }

  // 一覧・お気に入りのキャッシュを無効化してから遷移
  revalidatePath('/shops')
  revalidatePath('/favorite')
  redirect('/shops')
}
