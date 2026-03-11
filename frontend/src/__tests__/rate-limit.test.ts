import { describe, it, expect, vi, afterEach } from 'vitest'
import { rateLimit } from '@/lib/rate-limit'

describe('rateLimit()', () => {
  afterEach(() => {
    // 各テスト後にフェイクタイマーをリセット
    vi.useRealTimers()
  })

  it('制限未満のリクエストは resolve する', async () => {
    const limiter = rateLimit({ interval: 1000, uniqueTokenPerInterval: 100 })
    // limit=3 のとき、3回目まで成功する
    await expect(limiter.check(3, 'token-a')).resolves.toBeUndefined()
    await expect(limiter.check(3, 'token-a')).resolves.toBeUndefined()
    await expect(limiter.check(3, 'token-a')).resolves.toBeUndefined()
  })

  it('制限を超えたリクエストは reject する', async () => {
    const limiter = rateLimit({ interval: 1000, uniqueTokenPerInterval: 100 })
    // limit=2 のとき、3回目で失敗する
    await limiter.check(2, 'token-b')
    await limiter.check(2, 'token-b')
    await expect(limiter.check(2, 'token-b')).rejects.toThrow('Rate limit exceeded')
  })

  it('異なるトークンは独立してカウントされる', async () => {
    const limiter = rateLimit({ interval: 1000, uniqueTokenPerInterval: 100 })
    // token-c を制限に達しても token-d は独立している
    await limiter.check(1, 'token-c')
    await expect(limiter.check(1, 'token-c')).rejects.toThrow('Rate limit exceeded')

    // token-d はまだカウント 0 → 成功する
    await expect(limiter.check(1, 'token-d')).resolves.toBeUndefined()
  })

  it('interval 経過後はカウントが減少してリクエストが通る', async () => {
    vi.useFakeTimers()

    const limiter = rateLimit({ interval: 1000, uniqueTokenPerInterval: 100 })
    await limiter.check(1, 'token-e') // カウント 1 = 制限到達

    // interval 経過前は制限を超える
    await expect(limiter.check(1, 'token-e')).rejects.toThrow('Rate limit exceeded')

    // interval 経過後はカウントが 1 減少 → 成功する
    vi.advanceTimersByTime(1000)
    await expect(limiter.check(1, 'token-e')).resolves.toBeUndefined()
  })
})
