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

    // 3. shop_id を randomUUID() で一意のIDとして生成
    const shopId = randomUUID()

    // トランザクションのために必要な client 接続を取得
    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        // 4. "Shop" と "UserShop" に INSERT
        await client.query(
            `
      INSERT INTO "Shop" (
        "id",
        "name",
        "createdAt",
        "updatedAt"
      )
      VALUES ($1, $2, NOW(), NOW())
      `,
            [shopId, name]
        )

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
            [randomUUID(), shopId, userId, memo || null]
        )

        // 5. tags をカンマ区切りで split
        const tagsString = formData.get('tags') as string
        if (tagsString) {
            // 6. trim() して空文字除外
            const tags = tagsString
                .split(',')
                .map((t) => t.trim())
                .filter((t) => t !== '')

            // 7. 各タグについて処理
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
                    [randomUUID(), shopId, tagId]
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
                        [randomUUID(), shopId, userId, imageUrl]
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
