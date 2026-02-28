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

        // Shop テーブルに source カラムを追加 ('google' または 'manual')
        await client.query(`
      ALTER TABLE "Shop" 
      ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'google';
    `)
        console.log('Successfully added "source" column to Shop table')

    } catch (error) {
        console.error('Error adding column:', error)
    } finally {
        await client.end()
        console.log('Disconnected from database')
    }
}

main()
