'use server'

import { revalidatePath } from 'next/cache'
import { pool } from '@/lib/db.server'
import crypto from 'crypto'

export async function updateShop(shopId: string, formData: FormData) {
    // TODO: 実際の認証情報から userId を取得するように変更する
    const userId = 'user-1'
    const client = await pool.connect()

    try {
        const name = formData.get('name') as string
        const memo = formData.get('memo') as string || null
        const status = formData.get('status') as string
        const tagsInput = formData.get('tags') as string || ''

        // 1. バリデーション
        if (!name || name.trim() === '') {
            return { success: false, error: '店名は必須です' }
        }
        const rawTags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
        if (rawTags.length > 5) {
            return { success: false, error: 'タグは最大5つまでです' }
        }
        // タグ名の重複排除と空文字除外
        const tags = Array.from(new Set(rawTags))

        await client.query('BEGIN')

        // 2. 所有権・存在チェック (UserShopレコードがあるか)
        const accessCheck = await client.query(
            `SELECT id FROM "UserShop" WHERE "shopId" = $1 AND "userId" = $2`,
            [shopId, userId]
        )
        if (accessCheck.rowCount === 0) {
            throw new Error('お店が見つからないか、編集権限がありません')
        }

        // 3. Shop の更新 (全ユーザー共有のため、本来は権限設計が必要だがとりあえず更新)
        // （※仕様では Shop.name を更新するとあるので実行）
        await client.query(
            `UPDATE "Shop" SET "name" = $1, "updatedAt" = NOW() WHERE "id" = $2`,
            [name, shopId]
        )

        // 4. UserShop の更新
        await client.query(
            `UPDATE "UserShop" 
             SET "status" = $1, "memo" = $2, "updatedAt" = NOW() 
             WHERE "shopId" = $3 AND "userId" = $4`,
            [status, memo, shopId, userId]
        )

        // 5. タグの更新 (ShopTagを全削除してから再作成)
        // まず既存の紐付けを削除
        await client.query(
            `DELETE FROM "ShopTag" WHERE "shopId" = $1`,
            [shopId]
        )

        if (tags.length > 0) {
            for (const tagName of tags) {
                // Tagテーブルで既に存在するかSELECT
                const tagRes = await client.query(
                    'SELECT "id" FROM "Tag" WHERE "name" = $1 LIMIT 1',
                    [tagName]
                )

                let tagId: string
                if (tagRes.rows.length > 0) {
                    tagId = tagRes.rows[0].id
                } else {
                    // なければ INSERT INTO "Tag"
                    tagId = crypto.randomUUID()
                    await client.query(
                        'INSERT INTO "Tag" ("id", "name", "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())',
                        [tagId, tagName]
                    )
                }

                // ShopTag へのINSERT
                await client.query(
                    `INSERT INTO "ShopTag" ("id", "shopId", "tagId", "createdAt", "updatedAt")
                     VALUES ($1, $2, $3, NOW(), NOW())`,
                    [crypto.randomUUID(), shopId, tagId]
                )
            }
        }

        await client.query('COMMIT')

        // 6. DB更新後、詳細・一覧ページのキャッシュを再構築
        revalidatePath(`/shops/${shopId}`)
        revalidatePath('/shops')
        revalidatePath('/map')

        return { success: true }
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Failed to update shop:', error)
        if (error instanceof Error) {
            return { success: false, error: error.message }
        }
        return { success: false, error: '不明なエラーが発生しました' }
    } finally {
        client.release()
    }
}
