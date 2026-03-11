'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { randomUUID } from 'crypto'
import { uploadToS3 } from '@/lib/storage.server'
import type { ShopStatus } from '@/types/shop'
import type { ActionResult } from '@/lib/action-result'

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

  let shopId: string

  try {
    // Shop・UserShop・Tag・ShopTag をトランザクションで登録
    const result = await prisma.$transaction(async (tx) => {
      // placeId が指定されていれば既存 Shop を再利用、なければ新規作成
      let shop = placeId
        ? await tx.shop.findFirst({ where: { placeId } })
        : null

      if (!shop) {
        shop = await tx.shop.create({
          data: { name, address, lat, lng, placeId },
        })
      }

      // ユーザーとお店を紐づける（選択されたステータスで登録、VISITED/FAVORITE は訪問日時もセット）
      await tx.userShop.create({
        data: { userId, shopId: shop.id, status, memo, visitedAt },
      })

      // タグを upsert して ShopTag を登録（Tag.name に @unique があるため upsert 可能）
      for (const tagName of tags) {
        const tag = await tx.tag.upsert({
          where: { name: tagName },
          create: { name: tagName },
          update: {},
        })
        await tx.shopTag.create({
          data: { shopId: shop.id, tagId: tag.id },
        })
      }

      return { shopId: shop.id }
    })

    shopId = result.shopId
  } catch {
    return { success: false, error: '登録に失敗しました' }
  }

  // 写真を S3 にアップロードし、公開 URL を DB に保存（トランザクション外で実行）
  const photos = formData.getAll('photos') as File[]
  if (photos.length > 0) {
    for (const photo of photos) {
      if (photo.size > 0) {
        const imageUrl = await uploadToS3(photo)
        await prisma.shopPhoto.create({
          data: { shopId, userId, imageUrl },
        })
      }
    }
  }

  redirect('/shops')
}
