import { SettingsHeader } from "@/components/settings/SettingsHeader"
import { ContactForm } from "./_components/ContactForm"

export const metadata = {
    title: "お問い合わせ | 店コレ",
}

export default function ContactPage() {
    return (
        <>
            <SettingsHeader title="お問い合わせ" />

            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <ContactForm />
            </div>
        </>
    )
}
