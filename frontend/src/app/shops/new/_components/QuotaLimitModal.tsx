'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { addVideoRewardAction } from '@/app/actions/add-video-reward'

type Props = {
    open: boolean
    canAddVideo: boolean
    onVideoRewarded?: () => void
}

// クォータ上限到達時に表示するモーダル
// 手動入力・動画視聴・プレミアム導線の3セクションで構成
export function QuotaLimitModal({ open, canAddVideo, onVideoRewarded }: Props) {
    const router = useRouter()
    const [videoState, videoAction, isVideoPending] = useActionState(
        addVideoRewardAction,
        null
    )

    // videoState が更新されたタイミングで成功トーストとページ更新を実行
    // onSubmit では videoState がまだ null なので useEffect で監視する
    useEffect(() => {
        if (videoState?.success) {
            toast.success(`動画視聴特典が付与されました！残り ${videoState.data.remaining} 件`)
            router.refresh()
            onVideoRewarded?.()
        }
    }, [videoState])

    return (
        <Dialog open={open}>
            <DialogContent className="max-w-sm rounded-2xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-center text-lg font-bold text-gray-900">
                        今月のGoogle検索登録の上限に達しました
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-center text-sm text-gray-500">
                        以下の方法で引き続き登録できます
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                    {/* セクション1: 手動入力案内（常時表示） */}
                    <div className="rounded-xl border border-gray-200 p-4">
                        <p className="text-sm font-semibold text-gray-700">手動でお店を登録する</p>
                        <p className="mt-1 text-xs text-gray-500">
                            お店名・住所を直接入力する方法は制限なし
                        </p>
                        <Link
                            href="/shops/new?mode=manual"
                            className="mt-3 block w-full rounded-full bg-[#8fae8f] py-2 text-center text-sm font-medium text-white transition hover:bg-[#7b997b]"
                        >
                            手動で登録する
                        </Link>
                    </div>

                    {/* セクション2: 動画視聴（canAddVideo=true の場合のみ表示） */}
                    {canAddVideo && (
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                            <p className="text-sm font-semibold text-blue-800">動画を見て +3件追加</p>
                            <p className="mt-1 text-xs text-blue-600">
                                短い動画を視聴すると今月3件分追加されます（月3回まで）
                            </p>
                            {videoState?.success === false && (
                                <p className="mt-2 text-xs text-red-500">{videoState.error}</p>
                            )}
                            <form action={videoAction}>
                                <button
                                    type="submit"
                                    disabled={isVideoPending}
                                    className="mt-3 w-full rounded-full border border-blue-300 bg-white py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:opacity-50"
                                >
                                    {isVideoPending ? '処理中...' : '動画を見る（+3件）'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* セクション3: プレミアム導線（常時表示） */}
                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                        <p className="text-sm font-semibold text-amber-800">プレミアムプランに登録</p>
                        <p className="mt-1 text-xs text-amber-600">
                            月額300円で制限なし・広告なし
                        </p>
                        <Link
                            href="/settings/premium"
                            className="mt-3 block w-full rounded-full border border-amber-300 bg-white py-2 text-center text-sm font-medium text-amber-700 transition hover:bg-amber-50"
                        >
                            プレミアムプランを見る
                        </Link>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
