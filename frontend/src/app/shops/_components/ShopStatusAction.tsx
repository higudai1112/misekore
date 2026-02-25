'use client'

import { useState } from 'react'
import { updateShopStatus } from '@/app/actions/update-shop-status'
import type { ShopStatus } from '@/types/shop'

export function ShopStatusAction({
  shopId,
  status,
}: {
  shopId: string
  status: ShopStatus
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleChange(next: ShopStatus) {
    setLoading(true)
    await updateShopStatus(shopId, next)
    setLoading(false)
    setOpen(false)
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background backdrop-blur">
        <div className="mx-auto w-full max-w-2xl px-4 py-4">
          <button
            onClick={() => setOpen(true)}
            className="w-full rounded-md bg-primary py-3 text-white shadow-sm transition hover:opacity-90">
            ステータスを変更する
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <div className="w-full rounded-t-xl bg-white p-6 space-y-4">
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