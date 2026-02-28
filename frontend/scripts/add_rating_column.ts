import { Client } from 'pg'
import * as dotenv from 'dotenv'
import path from 'path'

// .env.local または .env を読み込む
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

async function main() {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
        throw new Error('DATABASE_URL is not set')
    }

    const client = new Client({
        connectionString,
    })

    try {
        await client.connect()
        console.log('Connected to database')

        // UserShop テーブルに rating カラムを追加 (1〜5の制約付き)
        await client.query(`
      ALTER TABLE "UserShop" 
      ADD COLUMN IF NOT EXISTS "rating" INTEGER NULL CHECK (rating >= 1 AND rating <= 5);
    `)
        console.log('Successfully added "rating" column with CHECK constraint to UserShop table')

    } catch (error) {
        console.error('Error adding column:', error)
    } finally {
        await client.end()
        console.log('Disconnected from database')
    }
}

main()
