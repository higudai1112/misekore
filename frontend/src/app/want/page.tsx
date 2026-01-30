import { SegmentTabs } from './_components/segment-tabs'
import { RestaurantCard } from './_components/restaurant-card'
import type { Restaurant } from './_components/restaurant-card'
import { AppLayout } from '@/components/layout/AppLayout'

const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'The Garden Bistro',
    walk: 'Main St. Station から徒歩5分',
    tags: ['Italian', 'Organic'],
    imageURL:
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80',
    status: 'visited',
  },
  {
    id: '2',
    name: 'The Garden Bistro',
    walk: 'Main St. Station から徒歩5分',
    tags: ['Italian', 'Organic'],
    imageURL:
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
    status: 'want',
  },
  {
    id: '3',
    name: 'The Garden Bistro',
    walk: 'Main St. Station から徒歩5分',
    tags: ['Italian', 'Organic'],
    imageURL:
      'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1200&q=80',
    status: 'want',
  },
  {
    id: '4',
    name: 'The Garden Bistro',
    walk: 'Main St. Station から徒歩5分',
    tags: ['Italian', 'Organic'],
    imageURL:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    status: 'visited',
  },
]

export default function WantPage() {
  return (
    <AppLayout>
      <main className="min-h-screen px-4 pt-6 pb-24 text-[15px] text-gray-800 sm:px-6 lg:px-10">
        {/* 背景の静かな霞 */}
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

          {/* タブ欄 */}
          <SegmentTabs />

          {/* お店カード一覧 */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {restaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
