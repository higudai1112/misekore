import 'server-only'
import { query, pool } from '@/lib/db.server'

// 無料プランの月間Google検索登録上限
export const FREE_MONTHLY_LIMIT = 5
// 動画視聴1回あたりの追加枠
export const VIDEO_REWARD_SLOTS = 3
// 月間動画視聴の上限回数
export const MAX_VIDEO_WATCHES = 3

// クォータ状態の型定義
export type QuotaStatus = {
  plan: 'FREE' | 'PREMIUM'
  usedCount: number
  videoCount: number
  baseLimit: number
  videoBonus: number   // videoCount * VIDEO_REWARD_SLOTS
  totalLimit: number   // baseLimit + videoBonus
  remaining: number    // totalLimit - usedCount (PREMIUMはInfinity)
  canAddVideo: boolean // videoCount < MAX_VIDEO_WATCHES
}

/** 日付から "YYYYMM" 形式の月キーを返す */
export function getMonthKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}${m}`
}

/** ユーザーのプランを取得する */
export async function getUserPlan(userId: string): Promise<'FREE' | 'PREMIUM'> {
  const rows = await query<{ plan: string; premiumExpiresAt: Date | null }>(
    `SELECT "plan", "premiumExpiresAt" FROM "User" WHERE "id" = $1`,
    [userId]
  )
  if (rows.length === 0) return 'FREE'

  const { plan, premiumExpiresAt } = rows[0]

  // 有効期限切れの場合は FREE 扱い
  if (plan === 'PREMIUM' && premiumExpiresAt !== null && premiumExpiresAt < new Date()) {
    return 'FREE'
  }
  return plan as 'FREE' | 'PREMIUM'
}

/** 今月のクォータ状態を取得する */
export async function getQuotaStatus(userId: string): Promise<QuotaStatus> {
  const plan = await getUserPlan(userId)
  const monthKey = getMonthKey()

  const rows = await query<{ usedCount: number; videoCount: number }>(
    `SELECT "usedCount", "videoCount" FROM "PlacesUsageLog"
     WHERE "userId" = $1 AND "monthKey" = $2`,
    [userId, monthKey]
  )

  const usedCount = rows[0]?.usedCount ?? 0
  const videoCount = rows[0]?.videoCount ?? 0
  const baseLimit = FREE_MONTHLY_LIMIT
  const videoBonus = videoCount * VIDEO_REWARD_SLOTS
  const totalLimit = baseLimit + videoBonus

  return {
    plan,
    usedCount,
    videoCount,
    baseLimit,
    videoBonus,
    totalLimit,
    // PREMIUMは残り無制限（Infinity）
    remaining: plan === 'PREMIUM' ? Infinity : Math.max(0, totalLimit - usedCount),
    canAddVideo: videoCount < MAX_VIDEO_WATCHES,
  }
}

/**
 * Google検索登録前にクォータを確認する
 * @returns true: 登録可能 / false: 上限超過
 */
export async function checkQuota(userId: string): Promise<boolean> {
  const status = await getQuotaStatus(userId)
  // PREMIUMは常に許可
  if (status.plan === 'PREMIUM') return true
  return status.remaining > 0
}

/**
 * Google検索登録後にクォータを消費する（アトミックにupsert）
 * PREMIUMユーザーはDB更新しない
 */
export async function consumeQuota(userId: string): Promise<void> {
  const plan = await getUserPlan(userId)
  if (plan === 'PREMIUM') return

  const monthKey = getMonthKey()

  // INSERT ... ON CONFLICT DO UPDATE でアトミックに +1（レースコンディション回避）
  await pool.query(
    `INSERT INTO "PlacesUsageLog" ("id", "userId", "monthKey", "usedCount", "videoCount", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, 1, 0, NOW(), NOW())
     ON CONFLICT ("userId", "monthKey")
     DO UPDATE SET "usedCount" = "PlacesUsageLog"."usedCount" + 1, "updatedAt" = NOW()`,
    [userId, monthKey]
  )
}

/**
 * 動画視聴報酬を付与する（videoCount +1）
 * @returns true: 付与成功 / false: 上限到達
 */
export async function addVideoReward(userId: string): Promise<boolean> {
  const monthKey = getMonthKey()

  // 現在のvideoCountを確認
  const rows = await query<{ videoCount: number }>(
    `SELECT "videoCount" FROM "PlacesUsageLog"
     WHERE "userId" = $1 AND "monthKey" = $2`,
    [userId, monthKey]
  )

  const currentVideoCount = rows[0]?.videoCount ?? 0

  // 上限到達済みの場合は false を返す
  if (currentVideoCount >= MAX_VIDEO_WATCHES) return false

  // upsert で videoCount を +1
  await pool.query(
    `INSERT INTO "PlacesUsageLog" ("id", "userId", "monthKey", "usedCount", "videoCount", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, 0, 1, NOW(), NOW())
     ON CONFLICT ("userId", "monthKey")
     DO UPDATE SET "videoCount" = "PlacesUsageLog"."videoCount" + 1, "updatedAt" = NOW()`,
    [userId, monthKey]
  )

  return true
}
