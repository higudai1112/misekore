'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { ShopStatus } from '@/types/shop'

export async function updateShop(shopId: string, formData: FormData) {
  // 認証チェック
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: '認証が必要です' }
  const userId = session.user.id

  const name = formData.get('name') as string
  const memo = (formData.get('memo') as string) || null
  const status = formData.get('status') as ShopStatus
  const tagsInput = (formData.get('tags') as string) || ''

  // バリデーション
  if (!name?.trim()) {
    return { success: false, error: '店名は必須です' }
  }
  const rawTags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
  if (rawTags.length > 5) {
    return { success: false, error: 'タグは最大5つまでです' }
  }
  const tags = Array.from(new Set(rawTags))

  try {
    await prisma.$transaction(async (tx) => {
      // 所有権チェック（自分の UserShop レコードが存在するか）
      const userShop = await tx.userShop.findUnique({
        where: { userId_shopId: { userId, shopId } },
      })
      if (!userShop) {
        throw new Error('お店が見つからないか、編集権限がありません')
      }

      // Shop の店名を更新
      await tx.shop.update({
        where: { id: shopId },
        data: { name },
      })

      // UserShop のステータス・メモを更新
      await tx.userShop.update({
        where: { userId_shopId: { userId, shopId } },
        data: { status, memo },
      })

      // タグを全削除してから再登録
      await tx.shopTag.deleteMany({ where: { shopId } })

      for (const tagName of tags) {
        const tag = await tx.tag.upsert({
          where: { name: tagName },
          create: { name: tagName },
          update: {},
        })
        await tx.shopTag.create({
          data: { shopId, tagId: tag.id },
        })
      }
    })

    revalidatePath(`/shops/${shopId}`)
    revalidatePath('/shops')
    revalidatePath('/map')

    return { success: true }
  } catch (error) {
    console.error('Failed to update shop:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: '不明なエラーが発生しました' }
  }
}
