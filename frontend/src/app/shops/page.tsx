export const dynamic = 'force-dynamic'

import { ShopList } from './_components/shop-list'
import { AppLayout } from '@/components/layout/AppLayout'
import { getAllShopsForList } from '@/lib/shop'

export default async function ShopsPage() {
  // サーバーサイドでDBから「行きたい」「行った」お店の一覧を取得
  const shops = await getAllShopsForList()

  return (
    <AppLayout>
      <main className="min-h-screen px-4 pt-6 pb-24 text-[15px] text-gray-800 sm:px-6 lg:px-10">
        {/* 背景の静かな霞（デコレーション） */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute top-0 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#dfe8df]/70 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-md space-y-5 sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
          {/* 検索欄 */}
          <div className="rounded-full bg-white px-4 py-3 ring-1 ring-[#8fae8f]/50">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>🔍</span>
              <input
                placeholder="お店を検索"
                className="w-full bg-transparent outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* タブとお店カード一覧 */}
          <ShopList shops={shops.map(s => ({
            id: s.id,
            name: s.name,
            walk: s.address ?? '',
            tags: s.tags,
            imageURL: '',
            status: s.status.toLowerCase() as any,
          }))} />
        </div>
      </main>
    </AppLayout>
  )
}
