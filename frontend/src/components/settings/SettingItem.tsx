import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { ReactNode } from "react"

interface SettingItemProps {
    title: string
    href?: string
    onClick?: () => void
    rightContent?: ReactNode
    destructive?: boolean // 危険な操作（削除など）用フラグ
}

/**
 * 設定画面の各項目を表示するカード型コンポーネント
 * hrefが渡された場合はLink、onClickが渡された場合はbuttonとして機能する
 */
export function SettingItem({
    title,
    href,
    onClick,
    rightContent,
    destructive = false,
}: SettingItemProps) {
    // リンク遷移またはクリック操作が可能なアクション項目かどうかを判定
    const isActionable = !!href || !!onClick

    // 内部に表示する共通のコンテンツ（アイコンやテキストなど）
    const content = (
        <div
            className={`flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm transition-colors ${
                // アクション可能な場合はホバー時に背景色を変更
                isActionable ? "hover:bg-gray-50" : ""
                } ${
                // 危険な操作の場合は赤枠を付ける
                destructive ? "border-red-200 ring-1 ring-red-100" : ""
                }`}
        >
            <span
                className={`text-[15px] font-medium ${
                    // 危険な操作の場合は赤文字にし、それ以外は通常カラー
                    destructive ? "text-red-600" : "text-gray-800"
                    }`}
            >
                {title}
            </span>
            <div className="flex items-center gap-2 text-gray-400">
                {/* 右側にカスタムコンテンツがあれば表示（トグルスイッチなど） */}
                {rightContent}
                {/* hrefがあり、かつカスタムコンテンツが無い場合はデフォルトで右矢印を表示 */}
                {href && !rightContent && <ChevronRight className="h-5 w-5 text-gray-400" />}
            </div>
        </div>
    )

    // hrefプロパティがある場合はLinkコンポーネントでラップする
    if (href) {
        return (
            <Link
                href={href}
                className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
            >
                {content}
            </Link>
        )
    }

    // onClickプロパティがある場合はbutton要素でラップする
    if (onClick) {
        return (
            <button
                type="button"
                onClick={onClick}
                className="block w-full rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
            >
                {content}
            </button>
        )
    }

    // どちらでもない（表示のみのアクションを持たない項目）場合はそのままdivでラップする
    return <div className="block">{content}</div>
}
