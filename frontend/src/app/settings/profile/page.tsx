import { SettingSection } from "@/components/settings/SettingSection"
import { SettingsHeader } from "@/components/settings/SettingsHeader"

export const metadata = {
    title: "プロフィール | 店コレ",
}

/**
 * プロフィール設定画面
 * パス: /settings/profile
 */
export default function ProfilePage() {
    return (
        <>
            {/* 戻るボタン付きのヘッダーを表示 */}
            <SettingsHeader title="プロフィール" />

            <div className="space-y-8">
                <SettingSection title="プロフィール情報">
                    {/* プロフィール情報を囲むカードUI */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <div className="flex flex-col items-center gap-4">
                            {/* アバター画像（ダミー） */}
                            <div className="h-24 w-24 rounded-full bg-gray-200"></div>
                            <div className="text-center">
                                {/* ユーザー名（ダミー） */}
                                <p className="text-lg font-bold text-gray-900">テストユーザー</p>
                                {/* ユーザーID（ダミー） */}
                                <p className="text-sm text-gray-500">@test_user</p>
                            </div>
                            {/* プロフィール編集ボタン（未実装ダミー） */}
                            <button className="mt-2 rounded-full bg-gray-100 px-8 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300">
                                編集
                            </button>
                        </div>
                    </div>
                </SettingSection>
            </div>
        </>
    )
}
