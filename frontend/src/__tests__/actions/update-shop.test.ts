import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.mock はファイル先頭にホイストされるため、モック関数は vi.hoisted() で定義する
const { mockAuth, mockTransaction } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockTransaction: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('@/lib/auth', () => ({ auth: mockAuth }))
vi.mock('@/lib/prisma', () => ({
  prisma: { $transaction: mockTransaction },
}))

import { updateShop } from '@/app/actions/update-shop'

describe('updateShop() バリデーション', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('未認証の場合は認証エラーを返す', async () => {
    // セッションなし
    mockAuth.mockResolvedValue(null)

    const formData = new FormData()
    formData.set('name', 'テスト店')

    const result = await updateShop('shop-1', formData)
    expect(result).toEqual({ success: false, error: '認証が必要です' })
  })

  it('店名が空の場合はバリデーションエラーを返す', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })

    const formData = new FormData()
    formData.set('name', '   ') // 空白のみ

    const result = await updateShop('shop-1', formData)
    expect(result).toEqual({ success: false, error: '店名は必須です' })
  })

  it('タグが5個を超える場合はバリデーションエラーを返す', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })

    const formData = new FormData()
    formData.set('name', 'テスト店')
    // カンマ区切りで6タグを設定
    formData.set('tags', 'タグ1,タグ2,タグ3,タグ4,タグ5,タグ6')

    const result = await updateShop('shop-1', formData)
    expect(result).toEqual({ success: false, error: 'タグは最大5つまでです' })
  })

  it('バリデーション通過後にDB更新が呼ばれる', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    // トランザクション成功
    mockTransaction.mockResolvedValue(undefined)

    const formData = new FormData()
    formData.set('name', 'テスト店')
    formData.set('status', 'WANT')

    const result = await updateShop('shop-1', formData)
    expect(mockTransaction).toHaveBeenCalledOnce()
    expect(result).toEqual({ success: true })
  })
})
