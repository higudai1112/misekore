import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

/**
 * DATABASE_URL が未設定のまま起動すると
 * Prisma v7 (Adapter) が初期化エラーになるため、
 * ビルド時などはダミーの値を設定して回避する
 */
const connectionString =
  process.env.DATABASE_URL || 'postgresql://build:build@localhost:5432/build'

/**
 * PostgreSQL connection pool
 * Neon / Docker / Node runtime 向け
 */
const pool = new Pool({
  connectionString,
})

/**
 * Prisma v7 Driver Adapter
 */
const adapter = new PrismaPg(pool)

/**
 * Hot Reload 対策（Next.js Dev）
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Prisma Client (v7 + adapter)
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
