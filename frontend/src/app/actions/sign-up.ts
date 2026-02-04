'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { signIn } from '@/lib/auth' // NextAuth(Auth.js) の signIn

type SignUpInput = {
  email: string
  password: string
  name?: string
}

export async function signUp(input: SignUpInput) {
  const { email, password, name } = input

  try {
    console.log('🟡 signUp start', { email })

    // ① 既存ユーザー確認
    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      throw new Error('USER_ALREADY_EXISTS')
    }

    // ② パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    // ③ ユーザー作成
    await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        profile: {
          create: {
            name,
          },
        },
      },
    })

    console.log('🟢 user created')

    // ④ 自動ログイン（Credentials）
    await signIn('credentials', {
      email,
      password,
      redirect: false, // Server Action では false にする
    })

    // ⑤ /want に遷移
    redirect('/want')
  } catch (error) {
    console.error('🔴 signUp error', error)
    throw error
  }
}

