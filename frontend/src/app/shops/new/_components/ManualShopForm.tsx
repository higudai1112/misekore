'use client'

import { useActionState } from 'react'
import { createManualShop } from '@/app/actions/create-manual-shop'
import { TagInput } from '../../_components/TagInput'
import { StatusRadio } from './StatusRadio'

export function ManualShopForm() {
    const [state, formAction, isPending] = useActionState(createManualShop, null)

    return (
        <form
            action={formAction}
            className="space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
        >
            {state && !state.success && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    {state.error}
                </p>
            )}

            {/* 店名 (必須) */}
            <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                    店名 <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 outline-none ring-1 ring-inset ring-gray-300 focus:bg-white focus:ring-2 focus:ring-[#8fae8f]"
                    placeholder="手入力で店名を登録"
                />
            </div>

            {/* 住所 (必須) */}
            <div>
                <label htmlFor="address" className="mb-1 block text-sm font-medium text-gray-700">
                    住所 <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="address"
                    name="address"
                    required
                    className="w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 outline-none ring-1 ring-inset ring-gray-300 focus:bg-white focus:ring-2 focus:ring-[#8fae8f]"
                    placeholder="東京都渋谷区〇〇 1-2-3"
                />
            </div>

            {/* タグ (任意, 最大5) */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    タグ
                </label>
                <TagInput />
            </div>

            {/* ステータス */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    ステータス
                </label>
                <StatusRadio />
            </div>

            {/* メモ (任意) */}
            <div>
                <label htmlFor="memo" className="mb-1 block text-sm font-medium text-gray-700">
                    メモ
                </label>
                <textarea
                    id="memo"
                    name="memo"
                    rows={4}
                    className="w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 outline-none ring-1 ring-inset ring-gray-300 focus:bg-white focus:ring-2 focus:ring-[#8fae8f]"
                    placeholder="気になるメニューなど"
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-full bg-[#8fae8f] py-3 font-medium text-white transition hover:bg-[#7b997b] disabled:opacity-50"
            >
                {isPending ? '登録中...' : '登録する'}
            </button>
        </form>
    )
}
