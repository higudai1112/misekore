import { auth } from "@/lib/auth"
import { query } from "@/lib/db.server"
import { SettingSection } from "@/components/settings/SettingSection"
import { SettingsHeader } from "@/components/settings/SettingsHeader"
import { ProfileEditForm } from "./_components/ProfileEditForm"
import type { QueryResultRow } from "pg"

export const metadata = {
    title: "プロフィール | 店コレ",
}

type ProfileRow = QueryResultRow & { name: string | null }

export default async function ProfilePage() {
    const session = await auth()
    const userId = session?.user?.id ?? ""

    const rows = await query<ProfileRow>(
        `SELECT name FROM profiles WHERE user_id = $1`,
        [userId]
    )
    const currentName = rows[0]?.name ?? ""

    return (
        <>
            <SettingsHeader title="プロフィール" />

            <div className="space-y-8">
                <SettingSection title="プロフィール情報">
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <div className="flex flex-col items-center gap-4">
                            {/* アバター（将来実装） */}
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#dfe8df] text-3xl font-bold text-[#8fae8f]">
                                {currentName ? currentName.charAt(0).toUpperCase() : "?"}
                            </div>
                            <p className="text-sm text-gray-500">{session?.user?.email}</p>
                        </div>
                    </div>
                </SettingSection>

                <SettingSection title="表示名の変更">
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <ProfileEditForm currentName={currentName} />
                    </div>
                </SettingSection>
            </div>
        </>
    )
}
