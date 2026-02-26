'use client'

import { useState } from 'react'
import { updateShopStatus } from '@/app/actions/update-shop-status'
import type { ShopStatus } from '@/types/shop'

// お店詳細画面の下部に固定され、お店のステータス（行きたい/行った/お気に入り）を変更するアクションバー
export function ShopStatusAction({
  shopId,
  status,
}: {
  shopId: string
  status: ShopStatus
}) {
  const [open, setOpen] = useState(false) // ステータス変更モーダル（ボトムシート）の開閉状態
  const [loading, setLoading] = useState(false) // 変更処理中のローディング状態

  // 選択された新しいステータスをDBに保存し、モーダルを閉じる
  async function handleChange(next: ShopStatus) {
    setLoading(true)
    await updateShopStatus(shopId, next)
    setLoading(false)
    setOpen(false)
  }

  return (
    <>
      {/* 画面下部（フッターの上）に固定される「ステータスを変更する」ボタンエリア */}
      <div className="fixed bottom-[60px] left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-t">
        <div className="mx-auto w-full max-w-2xl px-4 py-3">
          <button
            onClick={() => setOpen(true)}
            className="w-full rounded-full bg-primary py-3.5 text-white font-medium shadow-md transition hover:opacity-90 active:scale-[0.98]"
          >
            ステータスを変更する
          </button>
        </div>
      </div>

      {/* 画面全体を覆う暗い背景と、下から現れるモーダル（ボトムシート） */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-t-xl bg-white p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              disabled={loading}
              onClick={() => handleChange('WANT')}
              className="w-full rounded-md border py-3"
            >
              行きたい
            </button>
            <button
              disabled={loading}
              onClick={() => handleChange('VISITED')}
              className="w-full rounded-md border py-3"
            >
              行った
            </button>
            <button
              disabled={loading}
              onClick={() => handleChange('FAVORITE')}
              className="w-full rounded-md border py-3"
            >
              お気に入り
            </button>
            <button
              onClick={() => setOpen(false)}
              className="w-full py-2 text-sm text-muted-foreground"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </>
  )
}