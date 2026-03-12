import Link from "next/link"
import { ChevronLeft } from "lucide-react"

interface SettingsHeaderProps {
    title: string
}

/**
 * 設定の各サブページ上部に表示するヘッダーコンポーネント
 * 戻るボタンとページタイトルを持つ
 */
export function SettingsHeader({ title }: SettingsHeaderProps) {
    return (
        <div className="relative mb-8 flex items-center justify-center">
            {/* 設定トップ画面へ戻るリンク（左端に絶対配置） */}
            <Link
                href="/settings"
                className="absolute left-0 rounded-full p-2 transition-colors hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
            >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
            </Link>
            {/* 各ページの見出しタイトル（中央配置） */}
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
    )
}
