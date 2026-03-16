'use server'

import bcrypt from 'bcryptjs'
import { query, pool } from '@/lib/db.server'
import type { QueryResultRow } from 'pg'

type TokenRow = QueryResultRow & {
  id: string
  userId: string
  expiresAt: Date
}

// パスワードを再設定するServer Action
// token の有効性を確認し、新しいパスワードでハッシュを更新する
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // トークンを検索（有効期限内のものに限る）
    const tokens = await query<TokenRow>(
      `SELECT id, "userId", "expiresAt"
       FROM "PasswordResetToken"
       WHERE token = $1 AND "expiresAt" > NOW()
       LIMIT 1`,
      [token]
    )

    if (tokens.length === 0) {
      return { success: false, error: 'リンクが無効か期限切れです。再度パスワード再設定をリクエストしてください。' }
    }

    const { id: tokenId, userId } = tokens[0]

    // 新しいパスワードをハッシュ化
    const passwordHash = await bcrypt.hash(newPassword, 12)

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // User の passwordHash を更新
      await client.query(
        `UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE id = $2`,
        [passwordHash, userId]
      )

      // 使用済みトークンを削除
      await client.query(
        `DELETE FROM "PasswordResetToken" WHERE id = $1`,
        [tokenId]
      )

      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

    return { success: true }
  } catch (error) {
    console.error('resetPassword error:', error)
    return { success: false, error: 'エラーが発生しました。しばらくしてからお試しください。' }
  }
}
