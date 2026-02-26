'use server'

import { query } from '@/lib/db.server'
import { revalidatePath } from 'next/cache'
import type { ShopStatus } from '@/types/shop'

// お店のステータス（WANT / VISITED / FAVORITE）を更新するServer Action
export async function updateShopStatus(
  shopId: string,
  status: ShopStatus
): Promise<void> {
  const userId = 'user-1' // TODO: 認証機能実装後は auth() から実際のユーザーIDを取得する

  await query(
    `
    UPDATE "UserShop"
    SET
      "status" = $1::"ShopStatus",
      "visitedAt" =
        CASE
          WHEN $2 = 'VISITED' OR $2 = 'FAVORITE'
          THEN NOW()
          ELSE NULL
        END,
      "updatedAt" = NOW()
    WHERE "shopId" = $3
      AND "userId" = $4
    `,
    [status, status, shopId, userId]
  )

  // DB更新後、指定したパスのキャッシュを破棄して最新のデータを画面に反映させる
  revalidatePath(`/shops/${shopId}`)
}
