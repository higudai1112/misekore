// 共有ページ（/share/[shopId]）— 未ログインユーザーでも閲覧可能なお店公開ページ
// AppLayoutを使わず、シンプルなヘッダー＋カード＋固定フッターのみ構成
import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { getPublicShopDetail } from '@/lib/shop'
import { ShareShopCard } from './_components/ShareShopCard'
import { SaveToMisekoreButton } from './_components/SaveToMisekoreButton'

// generateMetadata と default の2重クエリを防ぐために React cache でメモ化
const getCachedShop = cache((shopId: string) => getPublicShopDetail(shopId))

type Props = {
  params: Promise<{ shopId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shopId } = await params
  const shop = await getCachedShop(shopId)

  if (!shop) {
    return { title: 'お店が見つかりません | 店コレ' }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  return {
    title: `${shop.name} | 店コレ`,
    description: shop.address ?? shop.name,
    openGraph: {
      title: `${shop.name} | 店コレ`,
      description: shop.address ?? shop.name,
      images: appUrl ? [`${appUrl}/OGP.png`] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${shop.name} | 店コレ`,
      description: shop.address ?? shop.name,
      images: appUrl ? [`${appUrl}/OGP.png`] : [],
    },
  }
}

export default async function ShareShopPage({ params }: Props) {
  const { shopId } = await params

  // セッション確認とお店取得を並列実行
  const [session, shop] = await Promise.all([
    auth(),
    getCachedShop(shopId),
  ])

  if (!shop) notFound()

  const isLoggedIn = !!session?.user

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー: ロゴ＋右側リンク */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-[#8fae8f]">
          店コレ
        </Link>
        {isLoggedIn ? (
          <Link
            href="/shops"
            className="text-sm font-medium text-[#8fae8f] hover:text-[#7b997b]"
          >
            マイリストへ
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium text-[#8fae8f] hover:text-[#7b997b]"
          >
            ログイン
          </Link>
        )}
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full pb-28">
        <ShareShopCard shop={shop} />
      </main>

      {/* 固定フッター: 保存ボタン */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 safe-area-inset-bottom">
        <div className="max-w-lg mx-auto">
          <SaveToMisekoreButton
            shopId={shop.id}
            placeId={shop.placeId}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </footer>
    </div>
  )
}
