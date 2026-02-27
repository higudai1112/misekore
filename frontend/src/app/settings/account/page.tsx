import { SettingSection } from "@/components/settings/SettingSection"
import { SettingItem } from "@/components/settings/SettingItem"
import { SettingsHeader } from "@/components/settings/SettingsHeader"

export const metadata = {
    title: "アカウント管理 | 店コレ",
}

/**
 * アカウント管理画面
 * パス: /settings/account
 */
export default function AccountPage() {
    return (
        <>
            {/* 戻るボタン付きのヘッダーを表示 */}
            <SettingsHeader title="アカウント管理" />

            <div className="space-y-8">
                <SettingSection title="ログイン情報">
                    {/* メールアドレスの表示。rightContentを使用して右側にテキストを表示 */}
                    <SettingItem
                        title="メールアドレス"
                        rightContent={
                            <span className="text-[15px] text-gray-500">test@example.com</span>
                        }
                    />
                    {/* パスワード変更へのリンク（未実装ダミー） */}
                    <SettingItem title="パスワード変更" href="#" />
                </SettingSection>

                <SettingSection title="危険な操作">
                    {/* アカウント削除機能。destructiveフラグで赤枠・赤文字にする */}
                    <SettingItem title="アカウント削除" destructive href="#" />
                </SettingSection>
            </div>
        </>
    )
}
