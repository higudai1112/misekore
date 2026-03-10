'use server'

import { auth, signOut } from '@/lib/auth'
import { query } from '@/lib/db.server'

export async function deleteAccount() {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return { success: false, error: '認証が必要です' }

    // CASCADE により UserShop, ShopPhoto, Profile も自動削除される
    await query(`DELETE FROM users WHERE id = $1`, [userId])

    await signOut({ redirectTo: '/' })
}
