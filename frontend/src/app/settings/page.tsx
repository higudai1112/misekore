import { SettingSection } from "@/components/settings/SettingSection"
import { SettingItem } from "@/components/settings/SettingItem"
import { signOut } from "@/lib/auth"

export const metadata = {
    title: "設定 | 店コレ",
}

/**
 * 設定トップ画面
 * パス: /settings
 */
export default function SettingsPage() {
    return (
        <>
            <h1 className="mb-8 text-2xl font-bold text-gray-900">設定</h1>

            <div className="space-y-8">
                {/* 各設定グループごとにSettingSectionでまとめる */}

                <SettingSection title="アカウント">
                    {/* プロフィール設定画面への遷移リンク */}
                    <SettingItem title="プロフィール" href="/settings/profile" />
                    {/* アカウント管理画面への遷移リンク */}
                    <SettingItem title="アカウント管理" href="/settings/account" />
                </SettingSection>

                <SettingSection title="表示設定">
                    {/* テーマ設定画面への遷移リンク */}
                    <SettingItem title="テーマ設定" href="/settings/appearance" />
                </SettingSection>

                <SettingSection title="通知">
                    {/* 通知設定画面への遷移リンク */}
                    <SettingItem title="通知設定" href="/settings/notifications" />
                </SettingSection>

                <SettingSection title="サポート">
                    {/* お問い合わせ画面への遷移リンク */}
                    <SettingItem title="お問い合わせ" href="/settings/contact" />
                </SettingSection>

                <SettingSection title="法的情報">
                    {/* 利用規約画面への遷移リンク */}
                    <SettingItem title="利用規約" href="/settings/terms" />
                    {/* プライバシーポリシー画面への遷移リンク */}
                    <SettingItem title="プライバシーポリシー" href="/settings/privacy" />
                </SettingSection>

                <SettingSection title="アカウント操作">
                    {/* ログアウト処理（Server Action） */}
                    <form
                        action={async () => {
                            "use server"
                            await signOut({ redirectTo: "/" })
                        }}
                    >
                        <button
                            type="submit"
                            className="w-full rounded-xl bg-white p-4 text-[15px] font-bold text-red-500 shadow-sm outline-none transition-colors hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-gray-300 active:bg-gray-100"
                        >
                            ログアウト
                        </button>
                    </form>
                </SettingSection>
            </div>
        </>
    )
}
