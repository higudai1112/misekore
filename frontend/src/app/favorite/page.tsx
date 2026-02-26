export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getFavoriteShops } from '@/lib/shop'
import { AppLayout } from '@/components/layout/AppLayout'
import { SegmentTabs } from '@/app/shops/_components/segment-tabs'
import { RestaurantCard } from '@/app/shops/_components/restaurant-card'

// お気に入り一覧ページ (Server Component)
export default async function FavoritePage() {
    // 1. auth() を使って現在のセッション（ログイン情報）を取得
    const session = await auth()

    // 2. ログインしていない場合はトップページ ( / ) にリダイレクトしてアクセスを防ぐ
    if (!session?.user) {
        redirect('/')
    }

    // 3. 既存のセッション(jwt)にidが含まれていない場合のフォールバック処理
    // （本来は再ログインが必要だが、暫定的に'user-1'とするフォールバックを入れている）
    const userId = session.user.id || 'user-1'

    // 4. DBから、このユーザーIDに紐づくステータス「FAVORITE」のお店のみを取得
    const shops = await getFavoriteShops(userId)

    return (
        // <AppLayout> 内に表示
        <AppLayout>
            {/* shopsページと同じ余白・ページ構造にする */}
            <main className="min-h-screen px-4 pt-6 pb-24 text-[15px] text-gray-800 sm:px-6 lg:px-10">

                {/* 背景の静かな霞 (shopsページと同様) */}
                <div className="pointer-events-none fixed inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#dfe8df]/70 blur-3xl" />
                </div>

                <div className="mx-auto w-full max-w-md space-y-5 sm:max-w-lg md:max-w-2xl lg:max-w-4xl">

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


                    {/* 取得したお気に入りのお店一覧を RestaurantCard コンポーネントで表示 */}
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
