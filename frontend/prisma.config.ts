import { defineConfig } from 'prisma/config'
import * as dotenv from 'dotenv'

// .env ファイルから環境変数を読み込む
dotenv.config()

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
