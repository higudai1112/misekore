'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/app/actions/sign-up'

// 新規アカウント登録機能を提供するページコンポーネント
export default function SignupPage() {
  // フォームの入力値を管理するステート
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  // エラーメッセージとローディング状態を管理するステート
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // フォーム送信時の処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // デフォルトのフォーム送信（ページ遷移）を防ぐ

    // 二重送信を防止
    if (loading) return

    setError('') // エラーをリセット

    // パスワードの一致確認バリデーション
    if (password !== passwordConfirmation) {
      setError('パスワードが一致しません')
      return
    }

    try {
      setLoading(true)
      const result = await signUp({ email, password })
      // 成功時は signUp 内で redirect('/shops') が実行されるためここには来ない
      // 失敗時は ActionResult が返る
      if (!result.success) {
        setError(result.error)
        return
      }
    } catch (err) {
      // signUp が ActionResult を返すようになったため、ここに来るのはネットワーク障害等
      setError('登録に失敗しました。')
    } finally {
      // 失敗時などにローディング状態を解除
      setLoading(false)
    }
  }

  // Googleアカウントで登録・ログイン
  async function handleGoogleSignIn() {
    await signIn('google', { callbackUrl: '/shops' })
  }

  // LINEアカウントで登録・ログイン
  async function handleLineSignIn() {
    await signIn('line', { callbackUrl: '/shops' })
  }

  // Apple Sign In で登録・ログイン
  async function handleAppleSignIn() {
    await signIn('apple', { callbackUrl: '/shops' })
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

        <h1 className="mb-6 text-center text-2xl font-bold">アカウント登録</h1>

        {/* ソーシャルアカウントで登録ボタン */}
        <div className="mb-6 space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <Image src="/google_icon4.png" alt="Google" width={20} height={20} />
            Googleで登録
          </button>
          <button
            type="button"
            onClick={handleLineSignIn}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#06C755] px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#05b34d]"
          >
            <Image src="/line_logo.png" alt="LINE" width={20} height={20} />
            LINEで登録
          </button>
          <button
            type="button"
            onClick={handleAppleSignIn}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-900"
          >
            <Image src="/apple_logo.png" alt="Apple" width={18} height={20} />
            Appleで登録
          </button>
        </div>

        {/* 区切り線 */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">またはメールアドレスで</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* メールアドレス入力欄 */}
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

          {/* パスワード入力欄 */}
          <div className="space-y-1">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* パスワード確認入力欄 */}
          <div className="space-y-1">
            <Label htmlFor="passwordConfirmation">パスワード確認</Label>
            <Input
              id="passwordConfirmation"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* 登録ボタン */}
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? '登録中...' : '登録'}
          </Button>
        </form>
      </div>
    </main>
  )
}
