'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { ShopStatus } from '@/types/shop'
import type { ActionResult } from '@/lib/action-result'

// お店のステータス（WANT / VISITED / FAVORITE）を更新するServer Action
export async function updateShopStatus(
  shopId: string,
  status: ShopStatus
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: '認証が必要です' }
  const userId = session.user.id

  try {
    await prisma.userShop.update({
      where: { userId_shopId: { userId, shopId } },
      data: {
        status,
        // VISITED または FAVORITE の場合は訪問日時を現在時刻にセット、WANT に戻す場合はクリア
        visitedAt: status === 'VISITED' || status === 'FAVORITE' ? new Date() : null,
      },
    })

    revalidatePath(`/shops/${shopId}`)
    revalidatePath('/shops')
    revalidatePath('/favorite')
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'ステータスの更新に失敗しました' }
  }
}
