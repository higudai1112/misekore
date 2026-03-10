'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ログイン機能を提供するページコンポーネント
export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    const email = formData.get('email')
    const password = formData.get('password')

    setError(null)
    setIsPending(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setIsPending(false)

    if (result?.error) {
      setError('メールアドレスかパスワードが違います')
      return
    }

    router.push('/shops')
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">ログイン</h1>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@example.com"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              name="password"
              type="password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={isPending}>
            {isPending ? 'ログイン中...' : 'ログイン'}
          </Button>
        </form>
      </div>
    </main>
  )
}

