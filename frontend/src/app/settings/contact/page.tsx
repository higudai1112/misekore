import { Mail } from "lucide-react"
import { SettingsHeader } from "@/components/settings/SettingsHeader"
import { ContactForm } from "./_components/ContactForm"

export const metadata = {
    title: "お問い合わせ | MISEKORE",
}

export default function ContactPage() {
    return (
        <>
            <SettingsHeader title="お問い合わせ" />

            {/* ヘッダーカード：アイコンと説明文 */}
            <div className="mb-4 flex items-center gap-4 rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#8fae8f]/15">
                    <Mail className="h-6 w-6 text-[#8fae8f]" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-900">お気軽にご連絡ください</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                        ご意見・ご要望・不具合報告など、どんな内容でもお待ちしています。
                    </p>
                </div>
            </div>

            {/* お問い合わせフォーム */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <ContactForm />
            </div>
        </>
    )
}
