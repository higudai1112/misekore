'use client'

// お店の位置情報（緯度経度）および住所を表示するコンポーネント
// ※現在は仮の実装としてテキスト表示のみだが、将来的にはGoogle Mapsなどを組み込む想定
export function ShopMap({
  lat,
  lng,
  address,
}: {
  lat: number | null
  lng: number | null
  address: string | null
}) {
  // 緯度と経度の両方が存在するかどうかを判定
  const hasLocation = lat != null && lng != null

  return (
    <div className="space-y-2">
      <div className="h-40 bg-muted flex items-center justify-center">
        {hasLocation ? (
          <span className="text-sm text-muted-foreground">
            緯度: {lat}, 経度: {lng}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">
            位置情報がありません
          </span>
        )}
      </div>

      {address && (
        <p className="text-sm text-muted-foreground">
          {address}
        </p>
      )}
    </div>
  )
}