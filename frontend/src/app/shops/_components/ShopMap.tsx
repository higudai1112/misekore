'use client'

export function ShopMap({
  lat,
  lng,
  address,
}: {
  lat: number | null
  lng: number | null
  address: string | null
}) {
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