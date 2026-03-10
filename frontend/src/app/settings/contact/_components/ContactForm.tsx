"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { sendContact } from "@/app/actions/send-contact"

export function ContactForm() {
    const [isPending, startTransition] = useTransition()

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const form = e.currentTarget
        startTransition(async () => {
            const result = await sendContact(formData)
            if (result.success) {
                toast.success("お問い合わせを送信しました。返信をお待ちください。")
                form.reset()
            } else {
                toast.error(result.error ?? "送信に失敗しました")
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-semibold text-gray-700">
                    件名
                </label>
                <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    placeholder="例: アプリの不具合について"
                    className="w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-[15px] outline-none transition-colors placeholder:text-gray-400 focus:border-[#8fae8f] focus:bg-white focus:ring-1 focus:ring-[#8fae8f]"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-semibold text-gray-700">
                    内容
                </label>
                <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="お問い合わせ内容をご記入ください"
                    className="w-full resize-y rounded-lg border bg-gray-50 px-4 py-2.5 text-[15px] outline-none transition-colors placeholder:text-gray-400 focus:border-[#8fae8f] focus:bg-white focus:ring-1 focus:ring-[#8fae8f]"
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl bg-[#8fae8f] py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fae8f] focus-visible:ring-offset-2"
            >
                {isPending ? "送信中..." : "送信する"}
            </button>
        </form>
    )
}
