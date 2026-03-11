'use server'

import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { signIn } from '@/lib/auth'
import { query } from '@/lib/db.server'
import { randomUUID } from 'crypto'
import type { QueryResultRow } from 'pg'
import type { ActionResult } from '@/lib/action-result'

type SignUpInput = {
  email: string
  password: string
  name?: string
}

type UserIdRow = QueryResultRow & {
  id: string
}

export async function signUp(input: SignUpInput): Promise<ActionResult> {
  const { email, password, name } = input

  console.log('🟡 signUp start (SQL)', { email })

  // ① 既存ユーザーの確認（同じメールアドレスが既に登録されていないかチェック）
  let existingUsers: UserIdRow[]
  try {
    existingUsers = await query<UserIdRow>(
      `SELECT id FROM "User" WHERE email = $1 LIMIT 1`,
      [email]
    )
  } catch {
    return { success: false, error: '登録に失敗しました' }
  }

  if (existingUsers.length > 0) {
    return { success: false, error: 'このメールアドレスは既に登録されています' }
  }

  // ② パスワードをハッシュ化
  const hashedPassword = await bcrypt.hash(password, 10)
  const userId = randomUUID()
  const now = new Date()

  try {
    // ③ "User" テーブルに新しいユーザーレコードを作成
    await query(
      `INSERT INTO "User" (id, email, "passwordHash", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5)`,
      [userId, email, hashedPassword, now, now]
    )

    // ④ "Profile" テーブルにプロフィールを作成
    await query(
      `INSERT INTO "Profile" (id, "userId", name, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5)`,
      [randomUUID(), userId, name ?? null, now, now]
    )
  } catch {
    return { success: false, error: '登録に失敗しました' }
  }

  console.log('🟢 user created')

  // ⑤ 登録成功後、自動ログイン
  await signIn('credentials', { email, password, redirect: false })

  // ⑥ ログイン完了後、一覧ページへリダイレクト
  redirect('/shops')
}
