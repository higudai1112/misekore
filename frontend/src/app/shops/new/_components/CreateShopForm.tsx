'use client'

import { useActionState } from 'react'
import { createShop } from '@/app/actions/create-shop'
import { TagInput } from '../../_components/TagInput'
import { PlaceSearchInput } from './PlaceSearchInput'

export function CreateShopForm() {
    const [state, formAction, isPending] = useActionState(createShop, null)

    return (
        <form action={formAction} className="space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            {state && !state.success && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    {state.error}
                </p>
            )}

            <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                    店名 <span className="text-red-500">*</span>
                </label>
                <PlaceSearchInput />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    タグ
                </label>
                <TagInput />
            </div>

            <div>
                <label htmlFor="photos" className="mb-1 block text-sm font-medium text-gray-700">
                    写真
                </label>
                <input
                    type="file"
                    id="photos"
                    name="photos"
                    accept="image/*"
                    multiple
                    className="w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-[#e6efe6] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#4f6f4f] hover:file:bg-[#d8e4d8]"
                />
            </div>

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
