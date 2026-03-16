'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { requestPasswordReset } from '@/app/actions/request-password-reset'

// パスワード再設定メール送信ページ
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // フォーム送信時にパスワード再設定メールをリクエストする
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isPending) return

    setError(null)
    setIsPending(true)

    try {
      const result = await requestPasswordReset(email)
      if (result.success) {
        setIsSent(true)
      } else {
        setError(result.error ?? 'エラーが発生しました')
      }
    } catch {
      setError('エラーが発生しました。しばらくしてからお試しください。')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-sm">
        {/* ログインへ戻るリンク */}
        <Link
          href="/login"
          className="mb-6 flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
          ログインへ戻る
        </Link>

        <h1 className="mb-2 text-center text-2xl font-bold">パスワード再設定</h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          登録済みのメールアドレスを入力してください。
          <br />
          パスワード再設定用のリンクをお送りします。
        </p>

        {isSent ? (
          // 送信完了メッセージ
          <div className="rounded-lg bg-green-50 p-4 text-center">
            <p className="font-medium text-green-800">メールを送信しました</p>
            <p className="mt-1 text-sm text-green-700">
              {email} にパスワード再設定のリンクを送信しました。
              メールボックスをご確認ください。
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block text-sm font-medium text-[#8fae8f] hover:underline"
            >
              ログインページへ
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@example.com"
                required
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={isPending}>
              {isPending ? '送信中...' : 'リセットメールを送信'}
            </Button>
          </form>
        )}
      </div>
    </main>
  )
}
