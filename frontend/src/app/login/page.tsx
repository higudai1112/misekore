'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ログイン機能を提供するページコンポーネント
export default function LoginPage() {
  // フォーム送信時に呼ばれる Server Action 相当の処理（NextAuthを用いたログイン）
  async function handleSubmit(formData: FormData) {
    const email = formData.get('email')
    const password = formData.get('password')

    // NextAuthの signIn 関数を呼び出し、Credentials（メアドとパスワード）で認証を試みる
    await signIn('credentials', {
      email,
      password,
      redirect: true,
      callbackUrl: '/shops', // 認証成功後に遷移する先のURL
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">ログイン</h1>

        {/* ログインフォーム。送信時に handleSubmit 処理が走る */}
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">メールアドレス</Label>
            {/* 🔑 name 属性を指定し、formData.get('email') で取得できるようにする */}
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@example.com"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">パスワード</Label>
            {/* 🔑 name 属性を指定し、formData.get('password') で取得できるようにする */}
            <Input
              id="password"
              name="password"
              type="password"
            />
          </div>

          {/* 🔑 type="submit" を明示 */}
          <Button type="submit" size="lg" className="w-full">
            ログイン
          </Button>
        </form>
      </div>
    </main>
  )
}

