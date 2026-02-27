"use client"

import { useState } from "react"
import { SettingSection } from "@/components/settings/SettingSection"
import { SettingItem } from "@/components/settings/SettingItem"
import { SettingsHeader } from "@/components/settings/SettingsHeader"
import { ToggleSwitch } from "@/components/settings/ToggleSwitch"

/**
 * 通知設定画面
 * Client ComponentとしてトグルのON/OFF状態を管理する
 * パス: /settings/notifications
 */
export default function NotificationsPage() {
    // メール通知・プッシュ通知ごとの有効/無効ステート（ダミー）
    const [emailEnabled, setEmailEnabled] = useState(true)
    const [pushEnabled, setPushEnabled] = useState(false)

    return (
        <>
            <SettingsHeader title="通知設定" />

            <div className="space-y-8">
                <SettingSection title="通知の受け取り">
                    {/* メール通知設定項目 */}
                    <SettingItem
                        title="メール通知"
                        rightContent={
                            // 右側に自作のiOS風トグルスイッチを配置
                            <ToggleSwitch checked={emailEnabled} onChange={setEmailEnabled} />
                        }
                    />
                    {/* プッシュ通知設定項目 */}
                    <SettingItem
                        title="プッシュ通知"
                        rightContent={
                            // 右側に自作のiOS風トグルスイッチを配置
                            <ToggleSwitch checked={pushEnabled} onChange={setPushEnabled} />
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
