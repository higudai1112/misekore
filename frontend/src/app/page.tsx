import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

// アプリ起動直後に表示されるトップページ（タイトルとログイン/登録への動線を持つ）
export default function TitlePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-sm text-center sm:max-w-md md:max-w-lg">
        {/* アプリアイコン */}
        <Image
          src="/icon.png"
          alt="店コレ"
          width={96}
          height={96}
          className="mx-auto mb-6 rounded-2xl"
          priority
        />

        {/* サービス名 */}
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">店コレ</h1>

        {/* キャッチコピー */}
        <p className="text-muted-foreground mb-8 text-sm sm:text-base">
          行く店、即答できる。
        </p>

        {/* アカウント登録画面、ログイン画面へのリンクボタン */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <Link href="/signup" className="w-full">
            <Button size="lg" className="w-full">
              アカウント登録
            </Button>
          </Link>

          <Link href="login" className="w-full">
            <Button variant="outline" size="lg" className="w-full">
              ログイン
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
