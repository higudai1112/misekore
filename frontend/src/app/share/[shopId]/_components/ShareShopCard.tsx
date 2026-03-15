// 共有ページで表示するお店情報カード（Server Component）
// memo・status・visitedAt等のプライベート情報は表示しない
import { ShopDetailMap } from '@/app/shops/_components/ShopDetailMap'
import type { PublicShopDetail } from '@/lib/shop'

type ShareShopCardProps = {
  shop: PublicShopDetail
}

export function ShareShopCard({ shop }: ShareShopCardProps) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
      {/* 写真: 先頭1枚を表示、なければグレープレースホルダー */}
      {shop.coverPhotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={shop.coverPhotoUrl}
          alt={shop.name}
          className="w-full h-56 object-cover"
        />
      ) : (
        <div className="w-full h-56 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">No Image</span>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* 店名 */}
        <h1 className="text-xl font-bold text-gray-900">{shop.name}</h1>

        {/* タグ: 最大2件表示 */}
        {shop.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {shop.tags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* 住所 */}
        {shop.address && (
          <p className="text-sm text-gray-500">{shop.address}</p>
        )}

        {/* 地図: lat/lng が両方ある場合のみ表示 */}
        {shop.lat != null && shop.lng != null && (
          <div className="pt-1">
            <ShopDetailMap
              latitude={shop.lat}
              longitude={shop.lng}
              shopName={shop.name}
            />
          </div>
        )}
      </div>
    </div>
  )
}
