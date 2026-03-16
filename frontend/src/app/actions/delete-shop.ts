'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/action-result'

export async function deleteShop(shopId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: '認証が必要です' }
  const userId = session.user.id

  try {
    // 自分の UserShop レコードのみ削除（お店本体は共有データのため残す）
    const result = await prisma.userShop.deleteMany({
      where: { shopId, userId },
    })

    if (result.count === 0) {
      return { success: false, error: '削除対象が見つからないか、権限がありません' }
    }

    revalidatePath('/shops')
    revalidatePath('/favorite')
    revalidatePath('/map')
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: '削除に失敗しました' }
  }
}
