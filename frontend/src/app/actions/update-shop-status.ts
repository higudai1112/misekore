'use server'

import { query } from '@/lib/db.server'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { ShopStatus } from '@/types/shop'

// お店のステータス（WANT / VISITED / FAVORITE）を更新するServer Action
export async function updateShopStatus(
  shopId: string,
  status: ShopStatus
): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  const userId = session.user.id

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
