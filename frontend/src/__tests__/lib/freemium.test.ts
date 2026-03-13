import { describe, it, expect, vi, beforeEach } from 'vitest'

// DB モックは vi.hoisted() で事前定義
const { mockQuery, mockPoolQuery } = vi.hoisted(() => ({
  mockQuery: vi.fn(),
  mockPoolQuery: vi.fn(),
}))

vi.mock('@/lib/db.server', () => ({
  query: mockQuery,
  pool: { query: mockPoolQuery },
}))

// server-only モジュールをスキップ
vi.mock('server-only', () => ({}))

import {
  getMonthKey,
  checkQuota,
  consumeQuota,
  addVideoReward,
  getQuotaStatus,
  FREE_MONTHLY_LIMIT,
  VIDEO_REWARD_SLOTS,
  MAX_VIDEO_WATCHES,
} from '@/lib/freemium'

describe('getMonthKey()', () => {
  it('正しい YYYYMM 形式を返す', () => {
    const result = getMonthKey(new Date('2026-03-14'))
    expect(result).toBe('202603')
  })

  it('1月は 01 にパディングされる', () => {
    const result = getMonthKey(new Date('2026-01-05'))
    expect(result).toBe('202601')
  })

  it('引数なしで現在月を返す', () => {
    const now = new Date()
    const expected = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
    expect(getMonthKey()).toBe(expected)
  })
})

describe('checkQuota()', () => {
  beforeEach(() => {
    // resetAllMocks で mockResolvedValueOnce キューも含めてリセット（テスト間の汚染防止）
    vi.resetAllMocks()
  })

  it('PREMIUMユーザーは常に true を返す', async () => {
    // checkQuota → getQuotaStatus → getUserPlan (1回) + usedCount/videoCount (1回) = 計2回
    mockQuery
      .mockResolvedValueOnce([{ plan: 'PREMIUM', premiumExpiresAt: null }])
      .mockResolvedValueOnce([{ usedCount: 99, videoCount: 0 }])

    const result = await checkQuota('user-premium')
    expect(result).toBe(true)
  })

  it('FREE残りあり → true', async () => {
    mockQuery
      .mockResolvedValueOnce([{ plan: 'FREE', premiumExpiresAt: null }])
      .mockResolvedValueOnce([{ usedCount: 3, videoCount: 0 }])

    const result = await checkQuota('user-free')
    expect(result).toBe(true)
  })

  it('FREE残りなし → false', async () => {
    mockQuery
      .mockResolvedValueOnce([{ plan: 'FREE', premiumExpiresAt: null }])
      .mockResolvedValueOnce([{ usedCount: 5, videoCount: 0 }])

    const result = await checkQuota('user-free')
    expect(result).toBe(false)
  })

  it('動画ボーナス込みで正しく判定（使用4件、動画1回視聴 → 残り4件）', async () => {
    mockQuery
      .mockResolvedValueOnce([{ plan: 'FREE', premiumExpiresAt: null }])
      // usedCount=4, videoCount=1 → totalLimit=5+3=8, remaining=4
      .mockResolvedValueOnce([{ usedCount: 4, videoCount: 1 }])

    const result = await checkQuota('user-free')
    expect(result).toBe(true)
  })
})

describe('consumeQuota()', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('PREMIUMユーザーはDB更新しない', async () => {
    mockQuery.mockResolvedValueOnce([{ plan: 'PREMIUM', premiumExpiresAt: null }])

    await consumeQuota('user-premium')
    expect(mockPoolQuery).not.toHaveBeenCalled()
  })

  it('FREEユーザーはupsertクエリを1回実行する', async () => {
    mockQuery.mockResolvedValueOnce([{ plan: 'FREE', premiumExpiresAt: null }])
    mockPoolQuery.mockResolvedValueOnce({ rows: [] })

    await consumeQuota('user-free')
    expect(mockPoolQuery).toHaveBeenCalledOnce()
    // INSERT ... ON CONFLICT を含むクエリであることを確認
    const [sql] = mockPoolQuery.mock.calls[0]
    expect(sql).toContain('ON CONFLICT')
    expect(sql).toContain('usedCount')
  })
})

describe('addVideoReward()', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('上限未満なら true を返し DB を更新する', async () => {
    // videoCount 確認クエリ
    mockQuery.mockResolvedValueOnce([{ videoCount: 1 }])
    mockPoolQuery.mockResolvedValueOnce({ rows: [] })

    const result = await addVideoReward('user-1')
    expect(result).toBe(true)
    expect(mockPoolQuery).toHaveBeenCalledOnce()
  })

  it('上限到達（videoCount=3）なら false を返し DB 更新しない', async () => {
    mockQuery.mockResolvedValueOnce([{ videoCount: MAX_VIDEO_WATCHES }])

    const result = await addVideoReward('user-1')
    expect(result).toBe(false)
    expect(mockPoolQuery).not.toHaveBeenCalled()
  })

  it('レコードなし（初回）なら true を返す', async () => {
    mockQuery.mockResolvedValueOnce([]) // レコードなし → videoCount=0
    mockPoolQuery.mockResolvedValueOnce({ rows: [] })

    const result = await addVideoReward('user-1')
    expect(result).toBe(true)
  })
})

describe('getQuotaStatus()', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('FREEユーザー・使用0件の状態が正しい', async () => {
    mockQuery
      .mockResolvedValueOnce([{ plan: 'FREE', premiumExpiresAt: null }])
      .mockResolvedValueOnce([{ usedCount: 0, videoCount: 0 }])

    const status = await getQuotaStatus('user-1')
    expect(status.plan).toBe('FREE')
    expect(status.usedCount).toBe(0)
    expect(status.baseLimit).toBe(FREE_MONTHLY_LIMIT)
    expect(status.totalLimit).toBe(FREE_MONTHLY_LIMIT)
    expect(status.remaining).toBe(FREE_MONTHLY_LIMIT)
    expect(status.canAddVideo).toBe(true)
  })

  it('FREEユーザー・動画1回視聴済みの残り計算が正しい', async () => {
    mockQuery
      .mockResolvedValueOnce([{ plan: 'FREE', premiumExpiresAt: null }])
      .mockResolvedValueOnce([{ usedCount: 3, videoCount: 1 }])

    const status = await getQuotaStatus('user-1')
    expect(status.videoBonus).toBe(VIDEO_REWARD_SLOTS)
    expect(status.totalLimit).toBe(FREE_MONTHLY_LIMIT + VIDEO_REWARD_SLOTS)
    expect(status.remaining).toBe(FREE_MONTHLY_LIMIT + VIDEO_REWARD_SLOTS - 3)
    expect(status.canAddVideo).toBe(true)
  })

  it('PREMIUMユーザーのremainingはInfinity', async () => {
    mockQuery
      .mockResolvedValueOnce([{ plan: 'PREMIUM', premiumExpiresAt: null }])
      .mockResolvedValueOnce([{ usedCount: 100, videoCount: 0 }])

    const status = await getQuotaStatus('user-premium')
    expect(status.remaining).toBe(Infinity)
    expect(status.plan).toBe('PREMIUM')
  })

  it('動画視聴3回到達でcanAddVideoがfalse', async () => {
    mockQuery
      .mockResolvedValueOnce([{ plan: 'FREE', premiumExpiresAt: null }])
      .mockResolvedValueOnce([{ usedCount: 0, videoCount: MAX_VIDEO_WATCHES }])

    const status = await getQuotaStatus('user-1')
    expect(status.canAddVideo).toBe(false)
  })
})
