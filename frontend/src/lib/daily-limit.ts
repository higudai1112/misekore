import 'server-only'
import { query, pool } from '@/lib/db.server'

// 1日あたりのGoogle Places API呼び出し上限
export const DAILY_API_CALL_LIMIT = 100
// 1日あたりのお店登録上限
export const DAILY_SHOP_REG_LIMIT = 100

/** 日付から "YYYYMMDD" 形式の日キーを返す */
export function getDayKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

/**
 * ユーザーの本日のAPI呼び出し上限を確認する
 * @returns true: 呼び出し可 / false: 上限超過
 */
export async function checkApiDailyLimit(userId: string): Promise<boolean> {
  const dayKey = getDayKey()
  const rows = await query<{ apiCallCount: number }>(
    `SELECT "apiCallCount" FROM "DailyUsageLog" WHERE "userId" = $1 AND "dayKey" = $2`,
    [userId, dayKey]
  )
  const count = rows[0]?.apiCallCount ?? 0
  return count < DAILY_API_CALL_LIMIT
}

/**
 * API呼び出しカウントをアトミックに+1する
 */
export async function incrementApiCallCount(userId: string): Promise<void> {
  const dayKey = getDayKey()
  // INSERT ... ON CONFLICT DO UPDATE でアトミックに +1（レースコンディション回避）
  await pool.query(
    `INSERT INTO "DailyUsageLog" ("id","userId","dayKey","apiCallCount","shopRegCount","createdAt","updatedAt")
     VALUES (gen_random_uuid(),$1,$2,1,0,NOW(),NOW())
     ON CONFLICT ("userId","dayKey")
     DO UPDATE SET "apiCallCount" = "DailyUsageLog"."apiCallCount" + 1, "updatedAt" = NOW()`,
    [userId, dayKey]
  )
}

/**
 * ユーザーの本日のお店登録上限を確認する
 * @returns true: 登録可 / false: 上限超過
 */
export async function checkShopRegDailyLimit(userId: string): Promise<boolean> {
  const dayKey = getDayKey()
  const rows = await query<{ shopRegCount: number }>(
    `SELECT "shopRegCount" FROM "DailyUsageLog" WHERE "userId" = $1 AND "dayKey" = $2`,
    [userId, dayKey]
  )
  const count = rows[0]?.shopRegCount ?? 0
  return count < DAILY_SHOP_REG_LIMIT
}

/**
 * お店登録カウントをアトミックに+1する
 */
export async function incrementShopRegCount(userId: string): Promise<void> {
  const dayKey = getDayKey()
  // INSERT ... ON CONFLICT DO UPDATE でアトミックに +1（レースコンディション回避）
  await pool.query(
    `INSERT INTO "DailyUsageLog" ("id","userId","dayKey","apiCallCount","shopRegCount","createdAt","updatedAt")
     VALUES (gen_random_uuid(),$1,$2,0,1,NOW(),NOW())
     ON CONFLICT ("userId","dayKey")
     DO UPDATE SET "shopRegCount" = "DailyUsageLog"."shopRegCount" + 1, "updatedAt" = NOW()`,
    [userId, dayKey]
  )
}
