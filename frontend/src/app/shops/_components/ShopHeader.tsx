'use client'

import { useRouter } from 'next/navigation'

type ShopHeaderProps = {
  shopId: string
}

export default function ShopHeader({ shopId }: ShopHeaderProps) {
  const router = useRouter()

  return (
    <header className="flex items-center justify-between p-4">
      {/* 戻るボタン。/shopsの一覧画面へ遷移する */}
      <button onClick={() => router.push('/shops')}>← 戻る</button>

      {/* 編集ボタン（現在は未実装のためdisabledとなっている） */}
      <button
        disabled
        className="text-muted-foreground"
        title={`shopId: ${shopId}`} // 開発時のデバッグ用にshopIdをtitle属性に設定
      >
        編集
      </button>
    </header>
  )
}
