'use client'

import { useState } from 'react'
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
      // Server Actionの signUp 関数を呼び出してDBに登録＆自動ログイン
      await signUp({
        email,
        password,
      })
      // 成功時、signUp 側で redirect(/shops) が実行されるためここには来ない
    } catch (err) {
      setError('登録に失敗しました。')
    } finally {
      // 失敗時などにローディング状態を解除
      setLoading(false)
    }
  }
  return (
    <main className="flex min-h-screen items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">アカウント登録</h1>

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
