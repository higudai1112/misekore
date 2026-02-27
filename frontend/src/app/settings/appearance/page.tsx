"use client"

import { useState } from "react"
import { SettingSection } from "@/components/settings/SettingSection"
import { SettingItem } from "@/components/settings/SettingItem"
import { SettingsHeader } from "@/components/settings/SettingsHeader"
import { Check } from "lucide-react"

/**
 * テーマ（外観）設定画面
 * Client Componentとして状態(ライト/ダーク)を管理する
 * パス: /settings/appearance
 */
export default function AppearancePage() {
    // 現在選択されているテーマを管理するステート（ダミー）
    const [theme, setTheme] = useState<"light" | "dark">("light")

    return (
        <>
            <SettingsHeader title="テーマ設定" />

            <div className="space-y-8">
                <SettingSection title="外観">
                    {/* ライトモード切り替えボタン */}
                    <SettingItem
                        title="ライトモード"
                        onClick={() => setTheme("light")}
                        rightContent={
                            // 選択されている場合は右端にチェックアイコンを表示
                            theme === "light" && <Check className="h-5 w-5 text-[#8fae8f]" />
                        }
                    />
                    {/* ダークモード切り替えボタン */}
                    <SettingItem
                        title="ダークモード"
                        onClick={() => setTheme("dark")}
                        rightContent={
                            // 選択されている場合は右端にチェックアイコンを表示
                            theme === "dark" && <Check className="h-5 w-5 text-[#8fae8f]" />
                        }
                    />
                </SettingSection>

                <p className="px-1 text-sm text-gray-500">
                    ※ 現在はデモ用のダミー実装です。
                </p>
            </div>
        </>
    )
}
