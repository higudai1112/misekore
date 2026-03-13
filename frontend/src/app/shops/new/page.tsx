export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AppLayout } from '@/components/layout/AppLayout'
import { CreateShopForm } from './_components/CreateShopForm'
import { ManualShopForm } from './_components/ManualShopForm'
import { getQuotaStatus } from '@/lib/freemium'

// お店登録ページ (Server Component)
export default async function NewShopPage({
    searchParams,
}: {
    searchParams: Promise<{ mode?: string }>
}) {
    // ログイン状態を確認（ログイン必須のページのため）
    const session = await auth()

    // ログインしていない場合、またはユーザーIDが取得できない場合はトップページへリダイレクト
    if (!session?.user?.id) {
        redirect('/')
    }

    const mode = (await searchParams).mode

    // 今月のクォータ状態を取得（Google検索登録の残り件数確認用）
    const quotaStatus = await getQuotaStatus(session.user.id)

    return (
        <AppLayout>
            <main className="min-h-screen px-4 pt-6 pb-24 text-[15px] text-gray-800 sm:px-6 lg:px-10">
                <div className="mx-auto w-full max-w-md sm:max-w-lg md:max-w-xl">
                    <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
                        {mode === 'manual' ? 'お店を手動で登録する' : 'お店を登録する'}
                    </h1>

                    {mode === 'manual' ? (
                        <ManualShopForm />
                    ) : (
                        <CreateShopForm quotaStatus={quotaStatus} />
                    )}
                </div>
            </main>
        </AppLayout>
    )
}
