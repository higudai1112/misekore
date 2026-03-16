import { auth } from "@/lib/auth"
import { query } from "@/lib/db.server"
import { SettingSection } from "@/components/settings/SettingSection"
import { SettingsHeader } from "@/components/settings/SettingsHeader"
import { ProfileEditForm } from "./_components/ProfileEditForm"
import { AvatarUploadForm } from "./_components/AvatarUploadForm"
import type { QueryResultRow } from "pg"

export const metadata = {
    title: "プロフィール | MISEKORE",
}

type ProfileRow = QueryResultRow & { name: string | null; avatarUrl: string | null }

export default async function ProfilePage() {
    const session = await auth()
    const userId = session?.user?.id ?? ""

    // avatarUrl も合わせて取得する
    const rows = await query<ProfileRow>(
        `SELECT name, "avatarUrl" FROM "Profile" WHERE "userId" = $1`,
        [userId]
    )
    const currentName = rows[0]?.name ?? ""
    const avatarUrl = rows[0]?.avatarUrl ?? null

    return (
        <>
            <SettingsHeader title="プロフィール" />

            <div className="space-y-8">
                <SettingSection title="プロフィール情報">
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <div className="flex flex-col items-center gap-4">
                            {/* プロフィール画像のアップロードフォーム */}
                            <AvatarUploadForm
                                currentAvatarUrl={avatarUrl}
                                currentName={currentName}
                            />
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
