// デバッグ用スクリプト: 特定ユーザーのお店一覧とタグを確認する
// 使い方: npx tsx check_tags.ts <userId>
import { getAllShopsForList } from './src/lib/shop'

async function main() {
  const userId = process.argv[2] || ''
  if (!userId) {
    console.error('Usage: npx tsx check_tags.ts <userId>')
    process.exit(1)
  }
  const res = await getAllShopsForList(userId)
  console.log(JSON.stringify(res, null, 2))
}
main()
