import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { SettingsHeader } from "@/components/settings/SettingsHeader"

export const metadata = {
    title: "送信完了 | 店コレ",
}

/**
 * お問い合わせ送信完了後の感謝ページ
 * パス: /settings/contact/thanks
 */
export default function ContactThanksPage() {
    return (
        <>
            <SettingsHeader title="送信完了" />

            <div className="rounded-xl border bg-white p-8 shadow-sm">
                <div className="flex flex-col items-center gap-4 text-center">
                    {/* 完了アイコン */}
                    <CheckCircle className="h-16 w-16 text-[#8fae8f]" />

                    <div className="space-y-2">
                        <h2 className="text-lg font-bold text-gray-900">
                            お問い合わせありがとうございます
                        </h2>
                        <p className="text-sm leading-relaxed text-gray-600">
                            内容を確認のうえ、折り返しご連絡いたします。
                            <br />
                            しばらくお待ちください。
                        </p>
                    </div>

                    {/* 設定へ戻るボタン */}
                    <Link
                        href="/settings"
                        className="mt-4 w-full rounded-xl bg-[#8fae8f] py-3 text-center text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
                    >
                        設定へ戻る
                    </Link>
                </div>
            </div>
        </>
    )
}
