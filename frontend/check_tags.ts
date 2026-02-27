import { pool } from './src/lib/db.server'
import { getAllShopsForList } from './src/lib/shop'

async function main() {
  const res = await getAllShopsForList()
  console.log(JSON.stringify(res, null, 2))
  await pool.end()
}
main()
