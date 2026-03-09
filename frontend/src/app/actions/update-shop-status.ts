'use server'

import { prisma } from '@/lib/prisma'
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

  await prisma.userShop.update({
    where: { userId_shopId: { userId, shopId } },
    data: {
      status,
      // VISITED または FAVORITE の場合は訪問日時を現在時刻にセット、WANT に戻す場合はクリア
      visitedAt: status === 'VISITED' || status === 'FAVORITE' ? new Date() : null,
    },
  })

  revalidatePath(`/shops/${shopId}`)
}
