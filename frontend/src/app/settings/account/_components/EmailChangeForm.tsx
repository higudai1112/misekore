"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { updateEmail } from "@/app/actions/update-email"

interface EmailChangeFormProps {
    currentEmail: string
}

export function EmailChangeForm({ currentEmail }: EmailChangeFormProps) {
    const [isPending, startTransition] = useTransition()

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const form = e.currentTarget
        startTransition(async () => {
            const result = await updateEmail(formData)
            if (result.success) {
                toast.success("メールアドレスを変更しました。ログアウット後に再ログインすると反映されます。")
                form.reset()
            } else {
                toast.error(result.error ?? "変更に失敗しました")
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* 現在のメールアドレスを表示（読み取り専用） */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                    現在のメールアドレス
                </label>
                <p className="rounded-lg border bg-gray-100 px-4 py-2.5 text-[15px] text-gray-500">
                    {currentEmail}
                </p>
            </div>

            {/* 新しいメールアドレス入力欄 */}
            <div className="space-y-2">
                <label htmlFor="newEmail" className="text-sm font-semibold text-gray-700">
                    新しいメールアドレス
                </label>
                <input
                    id="newEmail"
                    name="newEmail"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="example@email.com"
                    className="w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-[15px] outline-none transition-colors placeholder:text-gray-400 focus:border-[#8fae8f] focus:bg-white focus:ring-1 focus:ring-[#8fae8f]"
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl bg-[#8fae8f] py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fae8f] focus-visible:ring-offset-2"
            >
                {isPending ? "変更中..." : "メールアドレスを変更する"}
            </button>
        </form>
    )
}
