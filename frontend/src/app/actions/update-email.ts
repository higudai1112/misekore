'use server'

import { auth } from '@/lib/auth'
import { query } from '@/lib/db.server'
import type { QueryResultRow } from 'pg'

type EmailRow = QueryResultRow & { count: string }

export async function updateEmail(formData: FormData) {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return { success: false, error: '認証が必要です' }

    const newEmail = (formData.get('newEmail') as string | null)?.trim()

    // 入力値の検証
    if (!newEmail) return { success: false, error: '新しいメールアドレスを入力してください' }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
        return { success: false, error: '正しいメールアドレスの形式で入力してください' }
    }

    // 現在と同じメールアドレスでないかチェック
    if (session.user?.email === newEmail) {
        return { success: false, error: '現在と同じメールアドレスです' }
    }

    // 重複チェック（他のユーザーが同じメールアドレスを使用していないか）
    const existing = await query<EmailRow>(
        `SELECT COUNT(*) as count FROM "User" WHERE email = $1 AND id != $2`,
        [newEmail, userId]
    )
    if (parseInt(existing[0].count) > 0) {
        return { success: false, error: 'このメールアドレスはすでに使用されています' }
    }

    // メールアドレスを更新
    await query(
        `UPDATE "User" SET email = $1, "updatedAt" = NOW() WHERE id = $2`,
        [newEmail, userId]
    )

    return { success: true }
}
