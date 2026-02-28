'use server'

import { pool } from '@/lib/db.server'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { randomUUID } from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function createShop(formData: FormData) {
    // 1. auth() で現在のログイン状態（セッション）を確認
    const session = await auth()
    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const userId = session.user.id || 'user-1'

    // 2. name 必須バリデーション
    const name = formData.get('name') as string
    if (!name || name.trim() === '') {
        throw new Error('Name is required')
    }

    const memo = formData.get('memo') as string

    // 新しく追加されたプレイス情報
    const placeId = formData.get('placeId') as string | null
    const address = formData.get('address') as string | null
    const latStr = formData.get('lat') as string | null
    const lngStr = formData.get('lng') as string | null
    const lat = latStr ? parseFloat(latStr) : null
    const lng = lngStr ? parseFloat(lngStr) : null

    // トランザクションのために必要な client 接続を取得
    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        // 3. shop_id の決定 (既存があれば再利用、なければ新規作成)
        let finalShopId: string

        if (placeId) {
            // placeId が指定された場合、既存の Shop を検索
            const existingRes = await client.query(
                `SELECT "id" FROM "Shop" WHERE "placeId" = $1 LIMIT 1`,
                [placeId]
            )

            if (existingRes.rows.length > 0) {
                // 既存の店舗を使い回す
                finalShopId = existingRes.rows[0].id
            } else {
                // placeIdありで新規店舗作成
                finalShopId = randomUUID()
                await client.query(
                    `
                    INSERT INTO "Shop" (
                        "id", "name", "address", "lat", "lng", "placeId", "createdAt", "updatedAt"
                    ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                    `,
                    [finalShopId, name, address, lat, lng, placeId]
                )
            }
        } else {
            // placeIdなし（手入力など）の場合
            finalShopId = randomUUID()
            await client.query(
                `
                INSERT INTO "Shop" (
                    "id", "name", "address", "lat", "lng", "placeId", "createdAt", "updatedAt"
                ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                `,
                [finalShopId, name, address, lat, lng, null]
            )
        }

        // 4. "UserShop" に INSERT
        await client.query(
            `
      INSERT INTO "UserShop" (
        "id",
        "shopId",
        "userId",
        "status",
        "memo",
        "createdAt",
        "updatedAt"
      )
      VALUES ($1, $2, $3, 'WANT', $4, NOW(), NOW())
      `,
            [randomUUID(), finalShopId, userId, memo || null]
        )

        // 5. tags[] で取得
        const tags = formData.getAll('tags[]') as string[]
        if (tags && tags.length > 0) {
            for (const tagName of tags) {
                // 既に存在するか SELECT
                const tagRes = await client.query(
                    'SELECT "id" FROM "Tag" WHERE "name" = $1 LIMIT 1',
                    [tagName]
                )

                let tagId: string

                if (tagRes.rows.length > 0) {
                    tagId = tagRes.rows[0].id
                } else {
                    // なければ INSERT INTO "Tag"
                    tagId = randomUUID()
                    await client.query(
                        'INSERT INTO "Tag" ("id", "name", "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())',
                        [tagId, tagName]
                    )
                }

                // "ShopTag" に INSERT
                await client.query(
                    'INSERT INTO "ShopTag" ("id", "shopId", "tagId", "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())',
                    [randomUUID(), finalShopId, tagId]
                )
            }
        }

        // 8. formData.getAll('photos') で取得
        const photos = formData.getAll('photos') as File[]
        if (photos && photos.length > 0) {
            // 写真保存ディレクトリを作成（/public/uploads）
            const uploadDir = path.join(process.cwd(), 'public', 'uploads')
            await mkdir(uploadDir, { recursive: true })

            // 9. ファイルがあれば画像をローカル保存
            for (const photo of photos) {
                if (photo.size > 0) {
                    // 保存ファイル名は randomUUID() + 拡張子
                    const extension = photo.name.split('.').pop() || 'jpg'
                    const filename = `${randomUUID()}.${extension}`
                    const filepath = path.join(uploadDir, filename)

                    const arrayBuffer = await photo.arrayBuffer()
                    await writeFile(filepath, Buffer.from(arrayBuffer))

                    // 保存パスを image_url として "ShopPhoto" に INSERT
                    const imageUrl = `/uploads/${filename}`

                    await client.query(
                        `
            INSERT INTO "ShopPhoto" ("id", "shopId", "userId", "imageUrl", "createdAt")
            VALUES ($1, $2, $3, $4, NOW())
            `,
                        [randomUUID(), finalShopId, userId, imageUrl]
                    )
                }
            }
        }

        await client.query('COMMIT')
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }

    // 10. 全ての処理が成功したら、お店一覧（/shops）へリダイレクトする
    redirect('/shops')
}
