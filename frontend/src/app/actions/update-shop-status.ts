'use server'

import { query } from '@/lib/db.server'
import { revalidatePath } from 'next/cache'
import type { ShopStatus } from '@/types/shop'

export async function updateShopStatus(
  shopId: string,
  status: ShopStatus
): Promise<void> {
  const userId = 'user-1'

  await query(
    `
    UPDATE "UserShop"
    SET
      "status" = $1,
      "visitedAt" =
        CASE
          WHEN $1 = 'VISITED' OR $1 = 'FAVORITE'
          THEN NOW()
          ELSE NULL
        END,
      "updatedAt" = NOW()
    WHERE "shopId" = $2
      AND "userId" = $3
    `,
    [status, shopId, userId]
  )

  revalidatePath(`/shops/${shopId}`)
}
