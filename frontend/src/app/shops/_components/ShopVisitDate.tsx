import type { ShopStatus } from '@/types/shop'

export function ShopVisitDate({
  status,
  visitedAt,
}: {
  status: ShopStatus
  visitedAt: Date | null
}) {
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