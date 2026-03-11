import { AppLayout } from '@/components/layout/AppLayout'

export default function Loading() {
    return (
        <AppLayout>
            <div className="pb-40 px-4">
                <div className="mx-auto w-full max-w-2xl space-y-6">
                    {/* ヘッダースケルトン */}
                    <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />

                    {/* 写真スケルトン */}
                    <div className="h-56 rounded-2xl bg-gray-200 animate-pulse" />

                    {/* 店名・ステータススケルトン */}
                    <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                            <div className="h-8 w-48 rounded-lg bg-gray-200 animate-pulse" />
                            <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
                        </div>
                        <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
                    </div>

                    {/* メモ・タグ・地図スケルトン */}
                    <div className="h-24 rounded-xl bg-gray-200 animate-pulse" />
                    <div className="h-16 rounded-xl bg-gray-200 animate-pulse" />
                    <div className="h-48 rounded-xl bg-gray-200 animate-pulse" />
                </div>
            </div>
        </AppLayout>
    )
}
