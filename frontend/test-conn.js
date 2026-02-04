const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

async function main() {
  try {
    console.log('Attempting to connect with legacy datasources config...')
    await prisma.$connect()
    console.log('✅ Successfully connected!')
    await prisma.$disconnect()
  } catch (e) {
    console.error('❌ Connection failed:', e)
    process.exit(1)
  }
}

main()
