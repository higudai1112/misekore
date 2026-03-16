import Link from 'next/link'
import Image from 'next/image'
import { type Metadata } from 'next'
import { Button } from '@/components/ui/button'

// トップページ固定OGP（SNS共有時にアプリ紹介が表示されるように設定）
// 画像URLは環境変数に依存しないよう絶対URLで指定する
export const metadata: Metadata = {
  title: 'お店選びに迷わない',
  description: '行きたいお店を整理して、地図上で確認できるアプリ。おすすめのお店を聞かれても、もう困りません。',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: 'https://misekore.com',
    siteName: 'MISEKORE',
    locale: 'ja_JP',
    title: 'お店選びに迷わない',
    description: '行きたいお店を整理して、地図上で確認できるアプリ。おすすめのお店を聞かれても、もう困りません。',
    images: [
      {
        url: 'https://misekore.com/ogp.png',
        width: 1200,
        height: 630,
        alt: 'MISEKORE｜行く店、即答できる',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'お店選びに迷わない',
    description: '行きたいお店を整理して、地図上で確認できるアプリ。おすすめのお店を聞かれても、もう困りません。',
    images: ['https://misekore.com/ogp.png'],
  },
}

// アプリ起動直後に表示されるトップページ（タイトルとログイン/登録への動線を持つ）
export default function TitlePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 sm:px-6">

      {/* 背景グラデーション */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-[#eef4ee] via-white to-white" />

      {/* 背景の装飾的な円 */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[#8fae8f]/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-[#8fae8f]/10 blur-3xl" />
      </div>

      {/* メインコンテンツ */}
      <div className="w-full max-w-sm text-center">

        {/* アプリアイコン */}
        <div className="mx-auto mb-6 w-fit drop-shadow-lg">
          <Image
            src="/new_icon.png"
            alt="店コレ"
            width={120}
            height={120}
            className="rounded-[28px]"
            priority
            unoptimized
          />
        </div>

        {/* サービス名 */}
        <h1 className="mb-2 text-4xl font-bold tracking-[0.12em] text-gray-900 font-[family-name:var(--font-poppins)]">
          MISEKORE
        </h1>

        {/* キャッチコピー */}
        <p className="mb-10 text-base text-gray-500">
          行く店、即答できる。
        </p>

        {/* ボタン群 */}
        <div className="flex flex-col gap-3">
          <Link href="/signup" className="w-full">
            <Button
              size="lg"
              className="w-full rounded-xl bg-[#8fae8f] py-6 text-[15px] font-semibold text-white shadow-md hover:bg-[#7d9e7d] hover:shadow-lg transition-all"
            >
              アカウント登録
            </Button>
          </Link>

          <Link href="/login" className="w-full">
            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-xl border-[#8fae8f] py-6 text-[15px] font-semibold text-[#8fae8f] hover:bg-[#8fae8f]/10 transition-all"
            >
              ログイン
            </Button>
          </Link>
        </div>

        {/* 法的情報・サポートリンク */}
        <div className="mt-10 flex justify-center gap-5 text-xs text-gray-400">
          <Link href="/settings/privacy" className="hover:text-gray-600 transition-colors">
            プライバシーポリシー
          </Link>
          <Link href="/settings/terms" className="hover:text-gray-600 transition-colors">
            利用規約
          </Link>
          <Link href="/settings/contact" className="hover:text-gray-600 transition-colors">
            お問い合わせ
          </Link>
        </div>
      </div>
    </main>
  )
}
