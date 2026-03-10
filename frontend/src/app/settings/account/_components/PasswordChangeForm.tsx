"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { updatePassword } from "@/app/actions/update-password"

export function PasswordChangeForm() {
    const [isPending, startTransition] = useTransition()

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const form = e.currentTarget
        startTransition(async () => {
            const result = await updatePassword(formData)
            if (result.success) {
                toast.success("パスワードを変更しました")
                form.reset()
            } else {
                toast.error(result.error ?? "変更に失敗しました")
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="currentPassword" className="text-sm font-semibold text-gray-700">
                    現在のパスワード
                </label>
                <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-[15px] outline-none transition-colors placeholder:text-gray-400 focus:border-[#8fae8f] focus:bg-white focus:ring-1 focus:ring-[#8fae8f]"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">
                    新しいパスワード
                </label>
                <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="8文字以上"
                    className="w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-[15px] outline-none transition-colors placeholder:text-gray-400 focus:border-[#8fae8f] focus:bg-white focus:ring-1 focus:ring-[#8fae8f]"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                    新しいパスワード（確認）
                </label>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    autoComplete="new-password"
                    className="w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-[15px] outline-none transition-colors placeholder:text-gray-400 focus:border-[#8fae8f] focus:bg-white focus:ring-1 focus:ring-[#8fae8f]"
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl bg-[#8fae8f] py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fae8f] focus-visible:ring-offset-2"
            >
                {isPending ? "変更中..." : "パスワードを変更する"}
            </button>
        </form>
    )
}
