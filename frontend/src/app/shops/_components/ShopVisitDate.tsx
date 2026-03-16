import type { ShopStatus } from '@/types/shop'

// ユーザーがそのお店を「行った（またはお気に入り）」登録した日付を表示するコンポーネント
export function ShopVisitDate({
  status,
  visitedAt,
}: {
  status: ShopStatus
  visitedAt: Date | null
}) {
  // 「行きたい」ステータスの場合、または訪問日が記録されていない場合は何も表示しない
  // （「行きたい」時点ではまだ実際に行っていないため）
  if (
    status === 'WANT' || !visitedAt
  )
    return null

  return (
    <div className="text-sm text-muted-foreground">
      📅 {visitedAt.toLocaleDateString()}
    </div>
  )
}