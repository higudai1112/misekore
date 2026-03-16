'use server'

import { auth } from '@/lib/auth'
import { query } from '@/lib/db.server'
import { revalidatePath } from 'next/cache'

// プロフィール画像を削除するServer Action
// Profile テーブルの avatarUrl を NULL に更新してイニシャル表示に戻す
export async function removeAvatar(): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const userId = session.user.id

  try {
    await query(
      `UPDATE "Profile" SET "avatarUrl" = NULL, "updatedAt" = NOW() WHERE "userId" = $1`,
      [userId]
    )

    // レイアウト全体を再検証してアバター表示を更新する
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('removeAvatar error:', error)
    return { success: false, error: '画像の削除に失敗しました' }
  }
}
