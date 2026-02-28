'use server'

import { pool } from '@/lib/db.server'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function deleteShop(shopId: string) {
    const session = await auth()
    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const userId = session.user.id || 'user-1'
    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        // 自身の UserShop レコードを削除する
        const res = await client.query(
            `DELETE FROM "UserShop" WHERE "shopId" = $1 AND "userId" = $2`,
            [shopId, userId]
        )

        if (res.rowCount === 0) {
            throw new Error('削除対象が見つからないか、権限がありません')
        }

        // ShopTag などの関連付は Cascade、または不要レコードとして残っても良しとする
        // 今回は単純に自分のお店リストから外す仕様

        await client.query('COMMIT')

    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Failed to delete shop:', error)
        throw error
    } finally {
        client.release()
    }

    // 更新後にリダイレクト
    revalidatePath('/shops')
    revalidatePath('/map')
    redirect('/shops')
}
