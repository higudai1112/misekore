import { SegmentTabs } from '@/components/segment-tabs'
import { RestaurantCard } from '@/components/restaurant-card'
import { AppLayout } from '@/components/layout/AppLayout'

const restrants = [
  {
    id: '1',
    name: 'The Garden Bistro',
    walk: 'Main St. Station から徒歩5分',
    tags: ['Italian', 'Organic'],
    imageUrl:
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80',
    liked: false,
  },
  {
    id: '2',
    name: 'The Garden Bistro',
    walk: 'Main St. Station から徒歩5分',
    tags: ['Italian', 'Organic'],
    imageUrl:
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
    liked: true,
  },
  {
    id: '3',
    name: 'The Garden Bistro',
    walk: 'Main St. Station から徒歩5分',
    tags: ['Italian', 'Organic'],
    imageUrl:
      'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1200&q=80',
    liked: false,
  },
  {
    id: '4',
    name: 'The Garden Bistro',
    walk: 'Main St. Station から徒歩5分',
    tags: ['Italian', 'Organic'],
    imageUrl:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    liked: false,
  },
]

export default function WantPage() {
  return (
    <AppLayout>
      <main className="min-h-screen px-4 pb-24 pt-6 text-[15px] text-gray-800">
        { /* 背景の静かな霞 */ }
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-130 w-130 -translate-x-1/2 rounded-full bg-[#dfe8df]/70 blur-3xl" />
        </div>

        <div className="mx-auto max-w-md space-y-5">
          { /* 検索欄 */ }
          <div className="rounded-full bg-white px-4 py-3 ring-1 ring-[#8fae8f]/50">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>🔍</span>
              <input
                placeholder="お店を検索"
                className="w-full bg-transparent outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          { /* タブ欄 */ }
          <SegmentTabs />

          { /* お店カード一覧 */ }
          <div className="grid grid-cols-2 gap-4">
            {restrants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        </div>
      </main>
    </AppLayout>
  )
}