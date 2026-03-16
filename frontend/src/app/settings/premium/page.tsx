import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getUserPlan } from '@/lib/freemium'
import { Check } from 'lucide-react'

export const metadata = {
    title: 'プレミアムプラン | MISEKORE',
}

// プレミアムプラン紹介・登録ページ
export default async function PremiumPage() {
    const session = await auth()
    if (!session?.user?.id) redirect('/')

    const plan = await getUserPlan(session.user.id)

    return (
        <div className="mx-auto max-w-md space-y-6">
            <h1 className="text-center text-2xl font-bold text-gray-900">プレミアムプラン</h1>

            {/* 現在のプラン表示 */}
            <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-gray-500">現在のプラン:</span>
                {plan === 'PREMIUM' ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                        PREMIUM
                    </span>
                ) : (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
                        FREE
                    </span>
                )}
            </div>

            {/* 料金表 */}
            <div className="space-y-3">
                {/* 月額プラン */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">¥300</span>
                        <span className="text-sm text-gray-500">/ 月</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">月額プラン（いつでも解約可）</p>
                    <button
                        disabled
                        className="mt-4 w-full rounded-full bg-gray-200 py-3 text-sm font-medium text-gray-400"
                    >
                        近日公開予定
                    </button>
                </div>

                {/* 年額プラン */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-amber-800">¥3,000</span>
                                <span className="text-sm text-amber-600">/ 年</span>
                            </div>
                            <p className="mt-1 text-xs text-amber-600">年額プラン（2ヶ月分お得）</p>
                        </div>
                        <span className="ml-auto rounded-full bg-amber-200 px-2 py-1 text-xs font-bold text-amber-800">
                            おすすめ
                        </span>
                    </div>
                    <button
                        disabled
                        className="mt-4 w-full rounded-full bg-gray-200 py-3 text-sm font-medium text-gray-400"
                    >
                        近日公開予定
                    </button>
                </div>
            </div>

            {/* 特典リスト */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-gray-700">プレミアム特典</h2>
                <ul className="space-y-2">
                    {[
                        'Google検索登録が無制限',
                        '広告非表示',
                        '動画視聴不要',
                    ].map((benefit) => (
                        <li key={benefit} className="flex items-center gap-2 text-sm text-gray-700">
                            <Check className="h-4 w-4 flex-shrink-0 text-[#8fae8f]" />
                            {benefit}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
