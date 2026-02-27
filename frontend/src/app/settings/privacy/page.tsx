import { SettingsHeader } from "@/components/settings/SettingsHeader"

export const metadata = {
    title: "プライバシーポリシー | 店コレ",
}

/**
 * プライバシーポリシー画面（本文は将来実装用のプレースホルダー）
 * パス: /settings/privacy
 */
export default function PrivacyPage() {
    return (
        <>
            <SettingsHeader title="プライバシーポリシー" />

            {/* 仮テキスト表示用のカードコンテナ */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <p className="text-[15px] text-gray-500">※本文は後日実装予定です。</p>
            </div>
        </>
    )
}
