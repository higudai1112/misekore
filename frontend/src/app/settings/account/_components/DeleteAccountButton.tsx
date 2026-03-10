"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { deleteAccount } from "@/app/actions/delete-account"

export function DeleteAccountButton() {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    function handleDelete() {
        startTransition(async () => {
            try {
                await deleteAccount()
            } catch {
                toast.error("退会処理に失敗しました。しばらくしてから再度お試しください。")
                setOpen(false)
            }
        })
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="w-full rounded-xl border border-red-200 bg-red-50 py-3 text-[15px] font-semibold text-red-500 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
            >
                アカウントを削除する
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>アカウントを削除しますか？</DialogTitle>
                        <DialogDescription>
                            アカウントを削除すると、登録したすべてのお店データが完全に削除されます。この操作は取り消すことができません。
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                        >
                            キャンセル
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isPending}
                            className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            {isPending ? "処理中..." : "削除する"}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
