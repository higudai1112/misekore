import { ReactNode } from "react"

interface SettingSectionProps {
    title: string
    children: ReactNode
}

/**
 * 設定画面の各セクション（グループ）をまとめるコンポーネント
 * 
 * @param title - セクションのタイトル（上に小さく表示される）
 * @param children - セクション内に配置するSettingItemなどの要素
 */
export function SettingSection({ title, children }: SettingSectionProps) {
    return (
        // セクション全体の余白設定
        <section className="space-y-2">
            {/* セクションタイトルのスタイル（小さめのグレーテキスト） */}
            <h2 className="px-1 text-sm font-semibold text-gray-500">{title}</h2>
            {/* セクション内のアイテム間の余白設定 */}
            <div className="space-y-3">
                {children}
            </div>
        </section>
    )
}
