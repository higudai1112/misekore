import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.mock はファイル先頭にホイストされるため、モック関数は vi.hoisted() で定義する
const { mockQuery, mockSignIn } = vi.hoisted(() => ({
  mockQuery: vi.fn(),
  mockSignIn: vi.fn(),
}))

vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('@/lib/db.server', () => ({ query: mockQuery }))
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
  signIn: mockSignIn,
}))
vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn().mockResolvedValue('hashed-password') },
}))

import { signUp } from '@/app/actions/sign-up'

describe('signUp() バリデーション', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('既存メールアドレスの場合は重複エラーを返す', async () => {
    // 既存ユーザーが見つかった場合
    mockQuery.mockResolvedValue([{ id: 'existing-user' }])

    const result = await signUp({ email: 'test@example.com', password: 'password123' })
    expect(result).toEqual({
      success: false,
      error: 'このメールアドレスは既に登録されています',
    })
  })

  it('新規メールアドレスの場合はユーザー登録クエリが3回実行される', async () => {
    // 既存ユーザーなし → INSERT × 2 の順で呼ばれる
    mockQuery
      .mockResolvedValueOnce([]) // SELECT（既存チェック）
      .mockResolvedValueOnce([]) // INSERT User
      .mockResolvedValueOnce([]) // INSERT Profile

    mockSignIn.mockResolvedValue(undefined)

    await signUp({ email: 'new@example.com', password: 'password123', name: '太郎' })
    // SELECT 1回 + INSERT 2回 = 合計3回のDBアクセス
    expect(mockQuery).toHaveBeenCalledTimes(3)
  })

  it('DB エラー時は登録失敗エラーを返す', async () => {
    // SELECT は成功（既存なし）→ INSERT でエラー
    mockQuery
      .mockResolvedValueOnce([]) // SELECT
      .mockRejectedValueOnce(new Error('DB connection failed')) // INSERT User

    const result = await signUp({ email: 'fail@example.com', password: 'password123' })
    expect(result).toEqual({ success: false, error: '登録に失敗しました' })
  })
})
