import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AppLayout } from '@/components/layout/AppLayout'
import { createShop } from '@/app/actions/create-shop'

// お店登録ページ (Server Component)
export default async function NewShopPage() {
    // ログイン必須
    const session = await auth()

    if (!session?.user) {
        redirect('/')
    }

    return (
        <AppLayout>
            <main className="min-h-screen px-4 pt-6 pb-24 text-[15px] text-gray-800 sm:px-6 lg:px-10">
                <div className="mx-auto w-full max-w-md sm:max-w-lg md:max-w-xl">
                    <h1 className="mb-6 text-xl font-bold">お店を登録する</h1>

                    <form action={createShop} className="space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
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
                                placeholder="例: カフェ・ド・パリ"
                            />
                        </div>

                        <div>
                            <label htmlFor="tags" className="mb-1 block text-sm font-medium text-gray-700">
                                タグ
                            </label>
                            <input
                                type="text"
                                id="tags"
                                name="tags"
                                className="w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 outline-none ring-1 ring-inset ring-gray-300 focus:bg-white focus:ring-2 focus:ring-[#8fae8f]"
                                placeholder="例: カフェ, スイーツ, 隠れ家"
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                カンマ(,)区切りで複数入力できます
                            </p>
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
                            className="w-full rounded-full bg-[#8fae8f] py-3 font-medium text-white transition hover:bg-[#7b997b]"
                        >
                            登録する
                        </button>
                    </form>
                </div>
            </main>
        </AppLayout>
    )
}
