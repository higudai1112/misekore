'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from '@/app/actions/reset-password'

// パスワード再設定ページ（URLのトークンを使って認証し、新しいパスワードを設定する）
export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // フォーム送信時に新しいパスワードを設定する
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isPending) return

    // パスワードの一致確認
    if (newPassword !== confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    // パスワードの最小文字数チェック
    if (newPassword.length < 8) {
      setError('パスワードは8文字以上で入力してください')
      return
    }

    setError(null)
    setIsPending(true)

    try {
      const result = await resetPassword(params.token, newPassword)
      if (result.success) {
        // 成功後はログインページへリダイレクト
        router.push('/login?reset=success')
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

        <h1 className="mb-2 text-center text-2xl font-bold">新しいパスワードを設定</h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          8文字以上の新しいパスワードを入力してください。
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="newPassword">新しいパスワード</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirmPassword">パスワード確認</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={isPending}>
            {isPending ? '設定中...' : 'パスワードを設定'}
          </Button>
        </form>
      </div>
    </main>
  )
}
