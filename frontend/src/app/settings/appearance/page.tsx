"use client"

import { useTheme } from "next-themes"
import { SettingSection } from "@/components/settings/SettingSection"
import { SettingItem } from "@/components/settings/SettingItem"
import { SettingsHeader } from "@/components/settings/SettingsHeader"
import { Check } from "lucide-react"

export default function AppearancePage() {
    const { theme, setTheme } = useTheme()

    return (
        <>
            <SettingsHeader title="テーマ設定" />

            <div className="space-y-8">
                <SettingSection title="外観">
                    <SettingItem
                        title="ライトモード"
                        onClick={() => setTheme("light")}
                        rightContent={
                            theme === "light" && <Check className="h-5 w-5 text-[#8fae8f]" />
                        }
                    />
                    <SettingItem
                        title="ダークモード"
                        onClick={() => setTheme("dark")}
                        rightContent={
                            theme === "dark" && <Check className="h-5 w-5 text-[#8fae8f]" />
                        }
                    />
                </SettingSection>
            </div>
        </>
    )
}
