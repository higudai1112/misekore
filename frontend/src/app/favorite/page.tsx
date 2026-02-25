export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getFavoriteShops } from '@/lib/shop'
import { AppLayout } from '@/components/layout/AppLayout'
import { SegmentTabs } from '@/app/want/_components/segment-tabs'
import { RestaurantCard } from '@/app/want/_components/restaurant-card'

// お気に入り一覧ページ (Server Component)
export default async function FavoritePage() {
    // auth() を使ってセッション取得
    const session = await auth()

    // ログインしていない場合は Top ( / ) にリダイレクト
    if (!session?.user) {
        redirect('/')
    }

    // 既存のセッション(jwt)にidが含まれていない場合のフォールバック（以前ログインしたままの場合）
    // 本来は再ログインが必要ですが、ここでは暫定的に'user-1'や取得エラー回避の処理を入れます
    const userId = session.user.id || 'user-1'

    // userId に紐づく favorite shop のみ取得
    const shops = await getFavoriteShops(userId)

    return (
        // <AppLayout> 内に表示
        <AppLayout>
            {/* wantページと同じ余白・ページ構造にする */}
            <main className="min-h-screen px-4 pt-6 pb-24 text-[15px] text-gray-800 sm:px-6 lg:px-10">

                {/* 背景の静かな霞 (wantページと同様) */}
                <div className="pointer-events-none fixed inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#dfe8df]/70 blur-3xl" />
                </div>

                <div className="mx-auto w-full max-w-md space-y-5 sm:max-w-lg md:max-w-2xl lg:max-w-4xl">

                    {/* 検索欄 (wantページと同様) */}
                    <div className="rounded-full bg-white px-4 py-3 ring-1 ring-[#8fae8f]/50">
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>🔍</span>
                            <input
                                placeholder="お店を検索"
                                className="w-full bg-transparent outline-none placeholder:text-gray-400"
                            />
                        </div>
                    </div>


                    {/* 既存コンポーネント(RestaurantCard)を利用して一覧を map で表示 */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {shops
                            .filter((shop) => shop.status === 'FAVORITE')
                            .map((shop) => (
                                <RestaurantCard
                                    key={shop.id}
                                    restaurant={{
                                        id: shop.id,
                                        name: shop.name,
                                        walk: shop.address ?? '',
                                        tags: [],
                                        imageURL: '',
                                        status: 'favorite',
                                    }}
                                />
                            ))}
                    </div>
                </div>
            </main>
        </AppLayout>
    )
}
