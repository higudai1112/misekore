import 'server-only'
import { Pool, QueryResultRow } from 'pg'

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined
}

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : undefined,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool
}

// 👇 ★ここがポイント
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
