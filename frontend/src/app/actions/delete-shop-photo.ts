'use server'

import { query } from '@/lib/db.server'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// 写真を削除する（所有権チェックあり）
export async function deleteShopPhoto(photoId: string, shopId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  const userId = session.user.id

  // userId + photoId で所有権を確認してから削除
  await query(
    `DELETE FROM "ShopPhoto" WHERE id = $1 AND "userId" = $2`,
    [photoId, userId]
  )

  revalidatePath(`/shops/${shopId}`)
  return { success: true }
}
