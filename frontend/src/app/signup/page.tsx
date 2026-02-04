'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/app/actions/sign-up'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== passwordConfirmation) {
      setError('パスワードが一致しません')
      return
    }

    try {
      setLoading(true)
      await signUp({
        email,
        password,
      })
      alert('登録が完了しました')
    } catch (err) {
      setError('登録に失敗しました。')
    } finally {
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
          <Button size="lg" className="w-full" disabled={loading}>
            {loading ? '登録中...' : '登録'}
          </Button>
        </form>
      </div>
    </main>
  )
}
