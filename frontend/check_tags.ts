import { pool } from './src/lib/db.server'
import { getAllShopsForList } from './src/lib/shop'

// 開発用スクリプト: userId を引数で渡す（例: npx ts-node check_tags.ts <userId>）
async function main() {
  const userId = process.argv[2] ?? 'test-user'
  const res = await getAllShopsForList(userId)
  console.log(JSON.stringify(res, null, 2))
  await pool.end()
}
main()
