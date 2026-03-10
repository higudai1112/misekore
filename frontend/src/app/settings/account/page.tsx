import { auth } from "@/lib/auth"
import { SettingSection } from "@/components/settings/SettingSection"
import { SettingItem } from "@/components/settings/SettingItem"
import { SettingsHeader } from "@/components/settings/SettingsHeader"
import { PasswordChangeForm } from "./_components/PasswordChangeForm"
import { DeleteAccountButton } from "./_components/DeleteAccountButton"

export const metadata = {
    title: "アカウント管理 | 店コレ",
}

export default async function AccountPage() {
    const session = await auth()
    const email = session?.user?.email ?? ""

    return (
        <>
            <SettingsHeader title="アカウント管理" />

            <div className="space-y-8">
                <SettingSection title="ログイン情報">
                    <SettingItem
                        title="メールアドレス"
                        rightContent={
                            <span className="text-[15px] text-gray-500">{email}</span>
                        }
                    />
                </SettingSection>

                <SettingSection title="パスワード変更">
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <PasswordChangeForm />
                    </div>
                </SettingSection>

                <SettingSection title="危険な操作">
                    <div className="rounded-xl border border-red-100 bg-white p-6 shadow-sm">
                        <p className="mb-4 text-sm text-gray-600">
                            アカウントを削除すると、登録したすべてのお店データが失われます。この操作は取り消せません。
                        </p>
                        <DeleteAccountButton />
                    </div>
                </SettingSection>
            </div>
        </>
    )
}
