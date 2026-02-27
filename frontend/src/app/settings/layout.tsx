import { ReactNode } from "react"
import { AppLayout } from "@/components/layout/AppLayout"

/**
 * 設定画面全体（/settings配下すべて）の共通レイアウト
 * AppLayout（共通のナビゲーション等）の中に、最大幅(max-w-md)や背景エフェクトを適用
 */
export default function SettingsLayout({ children }: { children: ReactNode }) {
    return (
        <AppLayout>
            {/* 画面全体のpadding、背景の余白、フォントなどを一括指定 */}
            <main className="min-h-screen px-4 pb-24 pt-6 text-[15px] text-gray-800 sm:px-6 lg:px-10">

                {/* shopsページ等と同様の背景のぼかしエフェクトを配置 */}
                <div className="pointer-events-none fixed inset-0 -z-10">
                    <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#dfe8df]/70 blur-3xl" />
                </div>

                {/* PC表示などの大きな画面でも画面幅を制限して中央寄せにする */}
                <div className="mx-auto w-full max-w-md">
                    {children}
                </div>
            </main>
        </AppLayout>
    )
}
