import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

/**
 * DATABASE_URL が未設定のまま起動すると
 * Prisma が分かりづらいエラーを出すため、
 * ここで明示的にチェックする
 */
const connectionString = process.env.DATABASE_URL

/**
 * PostgreSQL connection pool
 * Neon / Docker / Node runtime 向け
 */
const pool = connectionString
  ? new Pool({
    connectionString,
  })
  : undefined

/**
 * Prisma v7 Driver Adapter
 */
const adapter = pool ? new PrismaPg(pool) : undefined

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
