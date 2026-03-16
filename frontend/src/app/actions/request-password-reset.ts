'use server'

import { randomUUID } from 'crypto'
import { query } from '@/lib/db.server'
import type { QueryResultRow } from 'pg'

type UserRow = QueryResultRow & {
  id: string
}

// パスワード再設定メールを送信するServer Action
// セキュリティのため、ユーザーが存在しない場合も成功レスポンスを返す
export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    // メールアドレスからユーザーを検索
    const users = await query<UserRow>(
      `SELECT id FROM "User" WHERE email = $1 LIMIT 1`,
      [email]
    )

    if (users.length === 0) {
      // ユーザーが存在しない場合もセキュリティのため成功を返す
      return { success: true }
    }

    const userId = users[0].id
    const token = randomUUID()
    // トークンの有効期限は1時間
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    // 既存のトークンを削除してから新しいトークンを挿入
    await query(
      `DELETE FROM "PasswordResetToken" WHERE "userId" = $1`,
      [userId]
    )
    await query(
      `INSERT INTO "PasswordResetToken" (id, "userId", token, "expiresAt", "createdAt")
       VALUES ($1, $2, $3, $4, NOW())`,
      [randomUUID(), userId, token, expiresAt]
    )

    // Cloudflare Worker 経由でリセットメールを送信
    const workerUrl = process.env.CLOUDFLARE_CONTACT_WORKER_URL
    if (workerUrl) {
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://misekore.com'}/reset-password/${token}`
      await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'password_reset',
          email,
          resetUrl,
        }),
      })
    }

    return { success: true }
  } catch (error) {
    console.error('requestPasswordReset error:', error)
    return { success: false, error: 'エラーが発生しました。しばらくしてからお試しください。' }
  }
}
