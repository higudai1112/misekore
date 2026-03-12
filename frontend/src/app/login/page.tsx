'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft } from 'lucide-react'
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

  // Googleログインボタン押下時の処理
  async function handleGoogleSignIn() {
    await signIn('google', { callbackUrl: '/shops' })
  }

  // LINEログインボタン押下時の処理
  async function handleLineSignIn() {
    await signIn('line', { callbackUrl: '/shops' })
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-sm">
        {/* タイトルへ戻るリンク */}
        <Link
          href="/"
          className="mb-6 flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
          トップへ戻る
        </Link>

        <h1 className="mb-6 text-center text-2xl font-bold">ログイン</h1>

        {/* ソーシャルログインボタン */}
        <div className="mb-6 space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <Image src="/google_icon4.png" alt="Google" width={20} height={20} />
            Googleでログイン
          </button>
          <button
            type="button"
            onClick={handleLineSignIn}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#06C755] px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#05b34d]"
          >
            <Image src="/line_logo.png" alt="LINE" width={20} height={20} />
            LINEでログイン
          </button>
        </div>

        {/* 区切り線 */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">またはメールアドレスで</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

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

