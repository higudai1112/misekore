import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

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
        <div className="mx-auto mb-6 w-fit drop-shadow-xl">
          <Image
            src="/icon.png"
            alt="店コレ"
            width={100}
            height={100}
            className="rounded-[24px]"
            priority
            unoptimized
          />
        </div>

        {/* サービス名 */}
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
          店コレ
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

        {/* 法的リンク（#50で追加予定） */}
      </div>
    </main>
  )
}
