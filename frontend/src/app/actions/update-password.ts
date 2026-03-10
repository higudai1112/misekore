'use server'

import { auth } from '@/lib/auth'
import { query } from '@/lib/db.server'
import bcrypt from 'bcryptjs'
import type { QueryResultRow } from 'pg'

type UserRow = QueryResultRow & { passwordHash: string }

export async function updatePassword(formData: FormData) {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return { success: false, error: '認証が必要です' }

    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { success: false, error: 'すべての項目を入力してください' }
    }
    if (newPassword.length < 8) {
        return { success: false, error: '新しいパスワードは8文字以上で入力してください' }
    }
    if (newPassword !== confirmPassword) {
        return { success: false, error: '新しいパスワードが一致しません' }
    }

    const rows = await query<UserRow>(
        `SELECT "passwordHash" FROM "User" WHERE id = $1`,
        [userId]
    )
    if (!rows[0]) return { success: false, error: 'ユーザーが見つかりません' }

    const isValid = await bcrypt.compare(currentPassword, rows[0].passwordHash)
    if (!isValid) return { success: false, error: '現在のパスワードが正しくありません' }

    const newHash = await bcrypt.hash(newPassword, 12)
    await query(
        `UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE id = $2`,
        [newHash, userId]
    )

    return { success: true }
}
