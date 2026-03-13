import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockAuth, mockAddVideoReward, mockGetQuotaStatus } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockAddVideoReward: vi.fn(),
  mockGetQuotaStatus: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: mockAuth }))
vi.mock('@/lib/freemium', () => ({
  addVideoReward: mockAddVideoReward,
  getQuotaStatus: mockGetQuotaStatus,
}))

import { addVideoRewardAction } from '@/app/actions/add-video-reward'

describe('addVideoRewardAction()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('未認証の場合は認証エラーを返す', async () => {
    mockAuth.mockResolvedValue(null)

    const result = await addVideoRewardAction(null)
    expect(result).toEqual({ success: false, error: '認証が必要です' })
  })

  it('上限未満なら success:true と remaining を返す', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockAddVideoReward.mockResolvedValue(true)
    mockGetQuotaStatus.mockResolvedValue({
      plan: 'FREE',
      remaining: 8,
      canAddVideo: true,
      usedCount: 0,
      videoCount: 1,
      baseLimit: 5,
      videoBonus: 3,
      totalLimit: 8,
    })

    const result = await addVideoRewardAction(null)
    expect(result).toEqual({ success: true, data: { remaining: 8 } })
  })

  it('上限到達ならエラーを返す', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockAddVideoReward.mockResolvedValue(false)

    const result = await addVideoRewardAction(null)
    expect(result).toEqual({
      success: false,
      error: '動画視聴の上限に達しています（月3回まで）',
    })
  })
})
