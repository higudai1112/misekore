export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getFavoriteShops } from '@/lib/shop'
import { AppLayout } from '@/components/layout/AppLayout'
import { TagFilteredShopList } from '@/app/shops/_components/tag-filtered-shop-list'
import { formatAddress } from '@/lib/utils'

// お気に入り一覧ページ (Server Component)
export default async function FavoritePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  // 認証済みユーザーの ID を渡してお気に入りのお店を取得
  const rawShops = await getFavoriteShops(session.user.id)
  const favoriteShops = rawShops.map((shop) => ({
    id: shop.id,
    name: shop.name,
    walk: formatAddress(shop.address ?? ''),
    tags: shop.tags,
    imageURL: '',
    status: 'favorite' as const,
  }))

  return (
    <AppLayout>
      <main className="min-h-screen px-4 pt-6 pb-24 text-[15px] text-gray-800 sm:px-6 lg:px-10">

        {/* 背景の静かな霞 */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute top-0 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#dfe8df]/70 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-md space-y-5 sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
          {/* ページタイトル */}
          <h1 className="text-center text-2xl font-bold text-gray-900">お気に入り</h1>

          {/* 検索入力欄（現状は見た目のみで、今後の実装用） */}
          <div className="rounded-full bg-white px-4 py-3 ring-1 ring-[#8fae8f]/50">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>🔍</span>
              <input
                placeholder="お店を検索"
                className="w-full bg-transparent outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* お気に入りのお店一覧をページネーションつきで表示 */}
          <TagFilteredShopList
            shops={favoriteShops}
            emptyMessage="誰かにおすすめできるお店を追加しましょう"
          />
        </div>
      </main>
    </AppLayout>
  )
}
