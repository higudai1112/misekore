'use server'

import { auth } from '@/lib/auth'
import { addVideoReward, getQuotaStatus } from '@/lib/freemium'
import type { ActionResult } from '@/lib/action-result'

// 動画視聴報酬を付与するServer Action
export async function addVideoRewardAction(
  _prevState: ActionResult<{ remaining: number }> | null
): Promise<ActionResult<{ remaining: number }>> {
  // 認証チェック
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: '認証が必要です' }
  const userId = session.user.id

  // 動画視聴報酬の付与（月3回上限）
  const rewarded = await addVideoReward(userId)
  if (!rewarded) {
    return { success: false, error: '動画視聴の上限に達しています（月3回まで）' }
  }

  // 更新後のクォータ状態を取得
  const status = await getQuotaStatus(userId)
  return {
    success: true,
    data: { remaining: status.remaining === Infinity ? 9999 : status.remaining },
  }
}
