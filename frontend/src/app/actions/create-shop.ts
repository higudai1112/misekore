'use server'

import { pool } from '@/lib/db.server'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { randomUUID } from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function createShop(formData: FormData) {
    // 1. auth() でログイン確認
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

    // 3. shop_id を randomUUID() で生成
    const shopId = randomUUID()

    // トランザクションのために必要な client 接続を取得
    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        // 4. shops に INSERT（status = 'WANT'）
        await client.query(
            `
      INSERT INTO shops (
        id,
        name,
        memo,
        user_id,
        status,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, 'WANT', NOW(), NOW())
      `,
            [shopId, name, memo || null, userId]
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
                    'SELECT id FROM tags WHERE name = $1 LIMIT 1',
                    [tagName]
                )

                let tagId: string

                if (tagRes.rows.length > 0) {
                    tagId = tagRes.rows[0].id
                } else {
                    // なければ INSERT INTO tags
                    tagId = randomUUID()
                    await client.query(
                        'INSERT INTO tags (id, name, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
                        [tagId, tagName]
                    )
                }

                // shop_tags に INSERT
                await client.query(
                    'INSERT INTO shop_tags (id, shop_id, tag_id, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
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

                    // 保存パスを image_url として shop_photos に INSERT
                    const imageUrl = `/uploads/${filename}`

                    await client.query(
                        `
            INSERT INTO shop_photos (id, shop_id, image_url, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            `,
                        [randomUUID(), shopId, imageUrl]
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

    // 10. redirect('/want')
    redirect('/want')
}
