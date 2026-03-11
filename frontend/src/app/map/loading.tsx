import { AppLayout } from '@/components/layout/AppLayout'

export default function Loading() {
    return (
        <AppLayout>
            <main className="flex h-screen flex-col px-4 pb-24 pt-6 sm:px-6 lg:px-10">
                <div className="mx-auto flex w-full max-w-md flex-1 flex-col sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
                    <div className="mb-4 h-8 w-24 rounded-lg bg-gray-200 animate-pulse" />
                    <div className="relative mb-4 flex-1 rounded-2xl bg-gray-200 animate-pulse" />
                </div>
            </main>
        </AppLayout>
    )
}
