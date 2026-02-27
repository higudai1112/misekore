"use client"

import { FormEvent } from "react"
import { SettingsHeader } from "@/components/settings/SettingsHeader"

/**
 * お問い合わせフォーム画面
 * パス: /settings/contact
 */
export default function ContactPage() {
    // フォーム送信時のハンドラー処理
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        // デフォルトのページ遷移（リロード）を防ぐ
        e.preventDefault()

        const form = e.currentTarget
        // フォーム内のデータを取得（現在はダミー実装のためconsole.logのみ）
        console.log("Submit contact form:", {
            subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
            message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
        })

        // ユーザーに完了を通知
        alert("お問い合わせを送信しました。（デモ）")

        // 送信後にフォームの入力内容をリセット
        form.reset()
    }

    return (
        <>
            <SettingsHeader title="お問い合わせ" />

            {/* フォーム全体を囲むカードUI */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
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

                    {/* お問い合わせ内容入力フィールド（テキストエリア） */}
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
                        ></textarea>
                    </div>

                    {/* 送信ボタン */}
                    <button
                        type="submit"
                        className="w-full rounded-xl bg-[#8fae8f] py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fae8f] focus-visible:ring-offset-2"
                    >
                        送信する
                    </button>
                </form>
            </div>
        </>
    )
}
