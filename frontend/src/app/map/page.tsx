import { AppLayout } from "@/components/layout/AppLayout"
import { ShopMap } from "@/components/map/ShopMap"

export const metadata = {
    title: "マップ | 店コレ",
}

export default function MapPage() {
    return (
        <AppLayout>
            {/* 
              ページ全体のメインコンテナ
              - h-screen: 画面の高さを100vhに設定
              - pb-24: 下部のフッター（AppLayout由来）と被らないように余白を確保
              - pt-6, px-4: 上部・左右の余白設定
            */}
            {/* フッターの高さ分（pb-24付近）空けて、マップが全画面に近い形で表示されるようにする */}
            <main className="flex h-screen flex-col px-4 pb-24 pt-6 text-[15px] text-gray-800 sm:px-6 lg:px-10">
                <div className="pointer-events-none fixed inset-0 -z-10">
                    <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#dfe8df]/70 blur-3xl" />
                </div>

                <div className="mx-auto flex w-full max-w-md flex-1 flex-col sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
                    <h1 className="mb-4 text-2xl font-bold text-gray-900">マップ</h1>

                    {/* 
                      マップを配置するコンテナ
                      - flex-1: 残りの縦幅をすべて埋めるように伸縮させる
                      - relative: 内部のShopMap（absolute等を使う場合）の基準点とする
                    */}
                    <div className="relative mb-4 flex-1">
                        {/* クライアントコンポーネントのGoogle Map本体を呼び出し */}
                        <ShopMap />
                    </div>


                    {/* 
                      ピンの色の凡例（レジェンド）表示エリア
                      - ユーザーがマップ上のピンが何の状態を示しているか一目で分かるようにする
                    */}
                    <div className="mb-2 flex justify-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <span className="inline-block h-3 w-3 rounded-full bg-blue-500"></span> 行きたい
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block h-3 w-3 rounded-full bg-gray-300"></span> 行った
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block h-3 w-3 rounded-full bg-red-500"></span> お気に入り
                        </span>
                    </div>
                </div>
            </main>
        </AppLayout>
    )
}
