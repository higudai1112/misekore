'use server'

import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { signIn } from '@/lib/auth'
import { query } from '@/lib/db.server'
import { randomUUID } from 'crypto'
import type { QueryResultRow } from 'pg'

type SignUpInput = {
  email: string
  password: string
  name?: string
}

type UserIdRow = QueryResultRow & {
  id: string
}

export async function signUp(input: SignUpInput) {
  const { email, password, name } = input

  try {
    console.log('🟡 signUp start (SQL)', { email })

    // ① 既存ユーザーの確認（同じメールアドレスが既に登録されていないかチェック）
    const existingUsers = await query<UserIdRow>(
      `
      SELECT id
      FROM "User"
      WHERE email = $1
      LIMIT 1
      `,
      [email]
    )

    if (existingUsers.length > 0) {
      throw new Error('USER_ALREADY_EXISTS')
    }

    // ② データベースに保存する前にパスワードをハッシュ化（暗号化）して安全にする
    const hashedPassword = await bcrypt.hash(password, 10)

    const userId = randomUUID()
    const now = new Date()

    // ③ "User" テーブルに新しいユーザーレコードを作成
    await query(
      `
      INSERT INTO "User" (
        id,
        email,
        "passwordHash",
        "createdAt",
        "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      [userId, email, hashedPassword, now, now]
    )

    // ④ "Profile" テーブルにプロフィールを作成（名前は任意入力項目のため null になる場合あり）
    await query(
      `
      INSERT INTO "Profile" (
        id,
        "userId",
        name,
        "createdAt",
        "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      [randomUUID(), userId, name ?? null, now, now]
    )

    console.log('🟢 user created')

    // ⑤ 登録成功後、そのまま自動的にログイン状態にする
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    // ⑥ ログイン完了後、一覧（/shops）ページへリダイレクトする
    redirect('/shops')
  } catch (error) {
    console.error('🔴 signUp error', error)
    throw error
  }
}
