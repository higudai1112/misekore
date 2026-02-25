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

    // ① 既存ユーザー確認
    const existingUsers = await query<UserIdRow>(
      `
      SELECT id
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [email]
    )

    if (existingUsers.length > 0) {
      throw new Error('USER_ALREADY_EXISTS')
    }

    // ② パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    const userId = randomUUID()
    const now = new Date()

    // ③ users 作成
    await query(
      `
      INSERT INTO users (
        id,
        email,
        password_hash,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      [userId, email, hashedPassword, now, now]
    )

    // ④ profiles 作成（名前は任意）
    await query(
      `
      INSERT INTO profiles (
        id,
        user_id,
        name,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      [randomUUID(), userId, name ?? null, now, now]
    )

    console.log('🟢 user created')

    // ⑤ 自動ログイン
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    // ⑥ リダイレクト
    redirect('/want')
  } catch (error) {
    console.error('🔴 signUp error', error)
    throw error
  }
}
