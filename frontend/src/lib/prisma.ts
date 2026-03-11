import 'server-only'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

// Next.js HMR でコネクションが増殖しないようにグローバルにキャッシュする
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Prisma 7 の Wasm エンジンは driver adapter が必須
  // PrismaPg に connectionString を渡すことで内部的に Pool を管理させる
  // pg v9 で sslmode=require の挙動が変わるため、uselibpqcompat=true を付与して現在の動作を維持する
  const connectionString = (process.env.DATABASE_URL ?? '').replace(
    'sslmode=require',
    'uselibpqcompat=true&sslmode=require'
  )
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
