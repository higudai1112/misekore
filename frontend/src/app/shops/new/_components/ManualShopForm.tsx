'use client'

import { createManualShop } from '@/app/actions/create-manual-shop'
import { TagInput } from '../../_components/TagInput'

export function ManualShopForm() {
    // フォーム送信時は Server Action (createManualShop) に直接 request を渡す
    // React 18の useTransition を使用すると redirect 時にエラーや意図しない挙動になるためアクションのみ指定
    return (
        <form
            action={createManualShop}
            className="space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
        >
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
                {/* 既存のTagInputを再利用。内部で name="tags[]" の hidden inputを生成する想定 */}
                <TagInput />
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
                className="w-full rounded-full bg-[#8fae8f] py-3 font-medium text-white transition hover:bg-[#7b997b] disabled:opacity-50"
            >
                登録する
            </button>
        </form>
    )
}
