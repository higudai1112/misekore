'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function deleteShop(shopId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  const userId = session.user.id

  // 自分の UserShop レコードのみ削除（お店本体は共有データのため残す）
  const result = await prisma.userShop.deleteMany({
    where: { shopId, userId },
  })

  if (result.count === 0) {
    throw new Error('削除対象が見つからないか、権限がありません')
  }

  revalidatePath('/shops')
  revalidatePath('/map')
  redirect('/shops')
}
