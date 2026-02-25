'use client'

import { useRouter } from 'next/navigation'

type ShopHeaderProps = {
  shopId: string
}

export default function ShopHeader({ shopId }: ShopHeaderProps) {
  const router = useRouter()

  return (
    <header className="flex items-center justify-between p-4">
      <button onClick={() => router.push('/want')}>← 戻る</button>

      <button
        disabled
        className="text-muted-foreground"
        title={`shopId: ${shopId}`} // 今は未使用だが将来用
      >
        編集
      </button>
    </header>
  )
}
