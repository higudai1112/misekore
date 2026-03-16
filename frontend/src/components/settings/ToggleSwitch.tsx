"use client"

interface ToggleSwitchProps {
    checked: boolean
    onChange: (checked: boolean) => void
}

/**
 * iOS風のトグルスイッチコンポーネント（shadcn非依存）
 */
export function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            // クリック時に現在の真偽値を反転させて親に完了を通知
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 ${
                // ONの場合はテーマカラー、OFFの場合はグレーにする
                checked ? "bg-[#8fae8f]" : "bg-gray-200"
                }`}
        >
            <span className="sr-only">設定を切り替える</span>
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    // ONの場合はスイッチを右(translate-x-5)へ、OFFの場合は左(translate-x-0)へ移動するアニメーション
                    checked ? "translate-x-5" : "translate-x-0"
                    }`}
            />
        </button>
    )
}
