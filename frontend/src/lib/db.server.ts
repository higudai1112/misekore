import 'server-only'
import { Pool, QueryResultRow } from 'pg'

// Next.jsのHot Module Replacement (HMR) 時にコネクションプールが増殖するのを防ぐための工夫
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined
}

// アプリケーション全体で使い回すDB接続プールを作成
export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL?.replace(
      'sslmode=require',
      'uselibpqcompat=true&sslmode=require'
    ),
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : undefined,
  })

// 開発環境ではglobalオブジェクトにプールを保存しておく
if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool
}

// SQLクエリを簡単に実行できるようにラップしたヘルパー関数
// DB接続を取得し、クエリを実行した後、必ず接続を解放（release）する役割を担う
export async function query<T extends QueryResultRow>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const client = await pool.connect()
  try {
    const result = await client.query<T>(text, params)
    return result.rows
  } finally {
    client.release()
  }
}
