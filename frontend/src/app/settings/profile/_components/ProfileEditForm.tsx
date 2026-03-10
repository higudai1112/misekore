"use client"

import { useRef, useState, useTransition } from "react"
import { toast } from "sonner"
import { updateProfile } from "@/app/actions/update-profile"

interface ProfileEditFormProps {
    currentName: string
}

export function ProfileEditForm({ currentName }: ProfileEditFormProps) {
    const [isPending, startTransition] = useTransition()
    const formRef = useRef<HTMLFormElement>(null)
    const [name, setName] = useState(currentName)

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(async () => {
            const result = await updateProfile(formData)
            if (result.success) {
                toast.success("表示名を更新しました")
            } else {
                toast.error(result.error ?? "更新に失敗しました")
            }
        })
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-semibold text-gray-700">
                    表示名
                </label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    maxLength={50}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="表示名を入力"
                    className="w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-[15px] outline-none transition-colors placeholder:text-gray-400 focus:border-[#8fae8f] focus:bg-white focus:ring-1 focus:ring-[#8fae8f]"
                />
            </div>

            <button
                type="submit"
                disabled={isPending || !name.trim()}
                className="w-full rounded-xl bg-[#8fae8f] py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fae8f] focus-visible:ring-offset-2"
            >
                {isPending ? "保存中..." : "保存する"}
            </button>
        </form>
    )
}
