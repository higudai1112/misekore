import type { ShopStatus } from '@/types/shop'

export function ShopStatusBadge({
  status,
}: {
  status: ShopStatus
}) {
  const map: Record<ShopStatus, string> = {
    WANT: '行きたい',
    VISITED: '行った',
    FAVORITE: 'お気に入り',
  }

  const color =
    status === 'WANT'
      ? 'bg-blue-100 text-blue-700'
      : status === 'VISITED'
        ? 'bg-green-100 text-green-700'
        : 'bg-yellow-100 text-yellow-700'

  return (
    <span className={`inline-block rounded-full px-3 text-sm ${color}`}>
      {map[status]}
    </span>
  )
}