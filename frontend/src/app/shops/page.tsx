export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { ShopList } from './_components/shop-list'
import { SearchInput } from './_components/search-input'
import { AppLayout } from '@/components/layout/AppLayout'
import { getAllShopsForList } from '@/lib/shop'
import { formatAddress } from '@/lib/utils'

type Props = {
  searchParams: Promise<{ q?: string }>
}

export default async function ShopsPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { q } = await searchParams
  const query = q?.trim() || undefined

  // 認証済みユーザーの ID を渡してお店一覧を取得（検索クエリでフィルタリング）
  const shops = await getAllShopsForList(session.user.id, query)

  return (
    <AppLayout>
      <main className="min-h-screen px-4 pt-6 pb-24 text-[15px] text-gray-800 sm:px-6 lg:px-10">
        {/* 背景の静かな霞（デコレーション） */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute top-0 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#dfe8df]/70 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-md space-y-5 sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
          {/* ページタイトル */}
          <h1 className="text-center text-2xl font-bold text-gray-900">お店一覧</h1>

          {/* 検索欄 */}
          <SearchInput defaultValue={q ?? ''} />

          {/* タブとお店カード一覧 */}
          <ShopList shops={shops.map((s) => ({
            id: s.id,
            name: s.name,
            walk: formatAddress(s.address ?? ''),
            tags: s.tags,
            imageURL: '',
            status: s.status.toLowerCase() as 'want' | 'visited' | 'favorite',
          }))} />
        </div>
      </main>
    </AppLayout>
  )
}
