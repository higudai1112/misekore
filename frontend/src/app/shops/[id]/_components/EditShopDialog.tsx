'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Pencil } from 'lucide-react'
import { updateShop } from '@/app/actions/update-shop'
import { deleteShop } from '@/app/actions/delete-shop'
import { toast } from 'sonner'
import type { ShopStatus } from '@/types/shop'

export type EditShopProps = {
    shopId: string
    defaultName: string
    defaultMemo: string
    defaultStatus: ShopStatus
    defaultTags: string[]
}

export function EditShopDialog({
    shopId,
    defaultName,
    defaultMemo,
    defaultStatus,
    defaultTags,
}: EditShopProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const [name, setName] = useState(defaultName)
    const [memo, setMemo] = useState(defaultMemo)
    const [status, setStatus] = useState<ShopStatus>(defaultStatus)
    const [tagsInput, setTagsInput] = useState(defaultTags.join(', '))
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!name.trim()) {
            setError('店名は必須です')
            return
        }

        const tagArray = tagsInput.split(',').map(tag => tag.trim()).filter(Boolean)
        if (tagArray.length > 5) {
            setError('タグは最大5つまでです')
            return
        }

        const formData = new FormData()
        formData.append('name', name)
        formData.append('memo', memo)
        formData.append('status', status)
        formData.append('tags', tagsInput)

        startTransition(async () => {
            try {
                const result = await updateShop(shopId, formData)
                if (result.success) {
                    toast.success('更新しました')
                    setIsOpen(false)
                } else {
                    setError(result.error || '更新に失敗しました')
                }
            } catch (err) {
                setError('ネットワークエラーが発生しました')
            }
        })
    }

    const handleDelete = async () => {
        if (!window.confirm('このお店を削除してもよろしいですか？')) return
        startTransition(async () => {
            try {
                await deleteShop(shopId)
                // 削除後のリダイレクトやメッセージは deleteShop 内で行うか、もしくはコンポーネント側で行う
                // deleteShop() 内部で redirect() しているため通常は遷移する
            } catch (err) {
                setError('削除に失敗しました')
            }
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="お店を編集する"
                    title="お店を編集する"
                >
                    <Pencil className="h-4 w-4" />
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md bg-stone-50 rounded-2xl p-6 border-0 shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-800 text-center mb-2">お店の情報を編集</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* 店名 */}
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                            店名 <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="お店の名前"
                            required
                        />
                    </div>

                    {/* ステータス */}
                    <div className="space-y-2">
                        <div className="block text-sm font-semibold text-gray-700">ステータス</div>
                        <div className="flex w-full overflow-hidden rounded-xl bg-gray-200 p-1">
                            <button
                                type="button"
                                onClick={() => setStatus('WANT')}
                                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${status === 'WANT'
                                    ? 'bg-white text-blue-600 shadow'
                                    : 'text-gray-500 hover:bg-gray-300'
                                    }`}
                            >
                                行きたい
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatus('VISITED')}
                                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${status === 'VISITED'
                                    ? 'bg-white text-gray-900 shadow'
                                    : 'text-gray-500 hover:bg-gray-300'
                                    }`}
                            >
                                行った
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatus('FAVORITE')}
                                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${status === 'FAVORITE'
                                    ? 'bg-white text-red-600 shadow'
                                    : 'text-gray-500 hover:bg-gray-300'
                                    }`}
                            >
                                お気に入り
                            </button>
                        </div>
                    </div>

                    {/* タグ */}
                    <div className="space-y-2">
                        <label htmlFor="tags" className="block text-sm font-semibold text-gray-700">
                            タグ (カンマ区切り、最大5個まで)
                        </label>
                        <input
                            id="tags"
                            type="text"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="カフェ, デート, 居酒屋"
                        />
                    </div>

                    {/* メモ */}
                    <div className="space-y-2">
                        <label htmlFor="memo" className="block text-sm font-semibold text-gray-700">
                            メモ
                        </label>
                        <textarea
                            id="memo"
                            rows={4}
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            className="w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="感想など..."
                        />
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                disabled={isPending}
                                className="flex-1 rounded-xl bg-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                            >
                                キャンセル
                            </button>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex-1 rounded-xl bg-[#8fae8f] py-3 text-sm font-semibold text-white hover:bg-[#7b997b] disabled:opacity-50"
                            >
                                {isPending ? '保存中...' : '保存'}
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isPending}
                            className="text-sm font-semibold text-red-500 hover:underline pt-2"
                        >
                            お店を削除する
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
