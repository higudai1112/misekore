import { AppLayout } from '@/components/layout/AppLayout'
import { notFound } from 'next/navigation'
import { getShopDetail } from '@/lib/shop'

import ShopHeader from '../_components/ShopHeader'
import { ShopPhotos } from '../_components/ShopPhotos'
import { ShopStatusBadge } from '../_components/ShopStatusBadge'
import { ShopTags } from '../_components/ShopTags'
import { ShopMemo } from '../_components/ShopMemo'
import { ShopVisitDate } from '../_components/ShopVisitDate'
import { ShopMap } from '../_components/ShopMap'
import { ShopStatusAction } from '../_components/ShopStatusAction'

export default async function ShopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const shop = await getShopDetail(id)

  if (!shop) {
    notFound()
  }

  return (
    <AppLayout>
      <div className="pb-28 px-4">
        <div className="mx-auto w-full max-w-2xl space-y-6">
        
          <ShopHeader shopId={shop.id} />

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
          <div className="rounded-xl bg-card p-4 shadow-sm space-y-4">
            <ShopMap
              lat={shop.lat}
              lng={shop.lng}
              address={shop.address}
            />
          </div>
        </div>

        <ShopStatusAction shopId={shop.id} status={shop.status} />
      </div>
    </AppLayout>
  )
}
