'use client'

import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const EditShopDialog = dynamic(
  () => import('../[id]/_components/EditShopDialog').then(mod => mod.EditShopDialog),
  { ssr: false }
)
import type { ShopStatus } from '@/types/shop'

type ShopHeaderProps = {
  shop: {
    id: string
    name: string
    memo: string | null
    status: ShopStatus
    rating: number | null
    tags: { id: string; name: string }[]
  }
}

export default function ShopHeader({ shop }: ShopHeaderProps) {
  const router = useRouter()

  return (
    <header className="flex items-center justify-between p-4 px-0">
      {/* 戻るボタン。/shopsの一覧画面へ遷移する */}
      <button
        onClick={() => router.push('/shops')}
        className="flex items-center text-gray-600 hover:text-gray-900 font-medium"
      >
        ← 戻る
      </button>

      {/* 編集モーダル */}
      <EditShopDialog
        shopId={shop.id}
        defaultName={shop.name}
        defaultMemo={shop.memo || ''}
        defaultStatus={shop.status}
        defaultTags={shop.tags.map(t => t.name)}
      />
    </header>
  )
}
