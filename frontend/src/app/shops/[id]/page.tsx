export const dynamic = 'force-dynamic'

import { AppLayout } from '@/components/layout/AppLayout'
import { notFound } from 'next/navigation'
import { getShopDetail } from '@/lib/shop'

import ShopHeader from '../_components/ShopHeader'
import { ShopPhotos } from '../_components/ShopPhotos'
import { ShopStatusBadge } from '../_components/ShopStatusBadge'
import { ShopTags } from '../_components/ShopTags'
import { ShopMemo } from '../_components/ShopMemo'
import { ShopVisitDate } from '../_components/ShopVisitDate'
import { ShopDetailMap } from '../_components/ShopDetailMap'
import { ShopStatusAction } from '../_components/ShopStatusAction'

// URLのパスパラメータ（例: /shops/[id] の [id] 部分）を受け取る
export default async function ShopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // パラメータからIDを取り出し、DBからお店の詳細情報を取得
  const { id } = await params
  const shop = await getShopDetail(id)

  // お店が見つからない場合は 404 (Not Found) ページを表示
  if (!shop) {
    notFound()
  }

  return (
    <AppLayout>
      {/* 画面下部のナビゲーションバーとステータス変更アクションバーの高さ分、下部に余白を持たせる */}
      <div className="pb-40 px-4">
        <div className="mx-auto w-full max-w-2xl space-y-6">

          <ShopHeader shop={shop} />

          {/* 写真 */}
          <div className="overflow-hidden rounded-2xl shadow-sm">
            <ShopPhotos photos={shop.photos} />
          </div>

          {/* 店名 + ステータス */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-semibold leading-tight">
                {shop.name}
              </h1>
              <ShopStatusBadge status={shop.status} />
            </div>

            <ShopVisitDate
              status={shop.status}
              visitedAt={shop.visitedAt}
            />
          </div>

          {/* メモ */}
          {shop.memo && (
            <div className="rounded-xl bg-card p-4 shadow-sm">
              <ShopMemo memo={shop.memo} />
            </div>
          )}

          {/* タグ */}
          {shop.tags.length > 0 && (
            <div className="rounded-xl bg-card p-4 shadow-sm">
              <ShopTags tags={shop.tags} />
            </div>
          )}

          {/* 地図 */}
          {(shop.lat != null && shop.lng != null) || shop.address ? (
            <div className="rounded-xl bg-card p-4 shadow-sm space-y-4">
              {shop.lat != null && shop.lng != null && (
                <ShopDetailMap
                  latitude={shop.lat}
                  longitude={shop.lng}
                  shopName={shop.name}
                />
              )}
              {shop.address && (
                <p className="text-sm text-gray-600">{shop.address}</p>
              )}
            </div>
          ) : null}
        </div>

        {/* 画面下部に固定表示するステータス変更用のアクションバー */}
        <ShopStatusAction shopId={shop.id} status={shop.status} />
      </div>
    </AppLayout>
  )
}
