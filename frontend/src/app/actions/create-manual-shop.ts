'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/action-result'

export async function createManualShop(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  // 認証チェック
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: '認証が必要です' }
  const userId = session.user.id

  // バリデーション
  const name = formData.get('name') as string
  const address = formData.get('address') as string
  const memo = (formData.get('memo') as string) || null

  if (!name?.trim()) return { success: false, error: '店名を入力してください' }
  if (!address?.trim()) return { success: false, error: '住所を入力してください' }

  // Google Geocoding API で緯度経度を取得（失敗しても登録は続行）
  let lat: number | null = null
  let lng: number | null = null

  const apiKey = process.env.GOOGLE_PLACES_SERVER_KEY
  if (apiKey) {
    try {
      const geocodeUrl = new URL('https://maps.googleapis.com/maps/api/geocode/json')
      geocodeUrl.searchParams.append('address', address)
      geocodeUrl.searchParams.append('key', apiKey)
      geocodeUrl.searchParams.append('language', 'ja')
      geocodeUrl.searchParams.append('region', 'jp')

      const response = await fetch(geocodeUrl.toString())
      if (response.ok) {
        const data = await response.json()
        if (data.status === 'OK' && data.results.length > 0) {
          const location = data.results[0].geometry.location
          lat = parseFloat(location.lat)
          lng = parseFloat(location.lng)
        }
      } else {
        console.warn('Geocoding API failed:', response.statusText)
      }
    } catch (error) {
      // Geocoding に失敗しても登録自体はブロックしない
      console.error('Error fetching lat/lng from Geocoding API:', error)
    }
  }

  const tags = formData.getAll('tags[]') as string[]

  try {
    await prisma.$transaction(async (tx) => {
      // 手動登録のため source='manual'、placeId は null
      const shop = await tx.shop.create({
        data: { name, address, lat, lng, source: 'manual' },
      })

      // ユーザーとお店を紐づける（初期ステータスは WANT）
      await tx.userShop.create({
        data: { userId, shopId: shop.id, status: 'WANT', memo },
      })

      // タグを登録（スパム防止のため最大5つまで）
      for (const tagName of tags.slice(0, 5)) {
        const tag = await tx.tag.upsert({
          where: { name: tagName },
          create: { name: tagName },
          update: {},
        })
        await tx.shopTag.create({
          data: { shopId: shop.id, tagId: tag.id },
        })
      }
    })
  } catch {
    return { success: false, error: '登録に失敗しました' }
  }

  revalidatePath('/shops')
  redirect('/shops')
}
