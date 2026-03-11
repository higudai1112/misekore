import { AppLayout } from '@/components/layout/AppLayout'

export default function Loading() {
    return (
        <AppLayout>
            <main className="min-h-screen px-4 pt-6 pb-24 sm:px-6 lg:px-10">
                <div className="mx-auto w-full max-w-md space-y-5 sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
                    {/* 検索欄スケルトン */}
                    <div className="h-12 rounded-full bg-gray-200 animate-pulse" />

                    {/* タブスケルトン */}
                    <div className="flex gap-2">
                        <div className="h-8 w-20 rounded-full bg-gray-200 animate-pulse" />
                        <div className="h-8 w-20 rounded-full bg-gray-200 animate-pulse" />
                        <div className="h-8 w-20 rounded-full bg-gray-200 animate-pulse" />
                    </div>

                    {/* カードスケルトン */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-40 rounded-xl bg-gray-200 animate-pulse" />
                        ))}
                    </div>
                </div>
            </main>
        </AppLayout>
    )
}
