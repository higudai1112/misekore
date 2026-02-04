'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  async function handleSubmit(formData: FormData) {
    const email = formData.get('email')
    const password = formData.get('password')

    await signIn('credentials', {
      email,
      password,
      redirect: true,
      callbackUrl: '/',
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">ログイン</h1>

        <form className="space-y-4">
          {/* メールアドレス入力欄 */}
          <div className="space-y-1">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" type="email" placeholder="example@example.com" />
          </div>

          {/* パスワード入力欄 */}
          <div className="space-y-1">
            <Label htmlFor="password">パスワード</Label>
            <Input id="password" type="password" />
          </div>

          <Button size="lg" className="w-full">
            ログイン
          </Button>
        </form>
      </div>
    </main>
  )
}
