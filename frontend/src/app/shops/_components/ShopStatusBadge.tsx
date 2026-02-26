import type { ShopStatus } from '@/types/shop'

// お店のステータスを色付きのラベル（バッジ）として表示するコンポーネント
export function ShopStatusBadge({
  status,
}: {
  status: ShopStatus
}) {
  // 英語のステータス名を日本語に変換するためのマップ
  const map: Record<ShopStatus, string> = {
    WANT: '行きたい',
    VISITED: '行った',
    FAVORITE: 'お気に入り',
  }

  // ステータスに応じて背景色と文字色を決定
  const color = status === 'WANT'
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