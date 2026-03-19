import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GETリクエストを処理するAPIエンドポイント（地図ページ用）
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // 緯度・経度が存在するお店のみ取得（地図に表示できるもの）
    const userShops = await prisma.userShop.findMany({
      where: {
        userId,
        shop: {
          lat: { not: null },
          lng: { not: null },
        },
      },
      select: {
        status: true,
        shop: {
          select: {
            id: true,
            name: true,
            lat: true,
            lng: true,
            // タグ情報（最大2件表示用）
            shopTags: {
              select: { tag: { select: { name: true } } },
            },
            // ユーザーの写真（1枚目のみ）
            shopPhotos: {
              where: { userId },
              orderBy: { createdAt: 'asc' },
              take: 1,
              select: { imageUrl: true },
            },
          },
        },
      },
    })

    const shops = userShops.map((us) => ({
      id: us.shop.id,
      name: us.shop.name,
      lat: us.shop.lat,
      lng: us.shop.lng,
      status: us.status,
      // タグ名のみ最大2件
      tags: us.shop.shopTags.slice(0, 2).map((st) => st.tag.name),
      // カバー画像URL（なければnull）
      coverImageUrl: us.shop.shopPhotos[0]?.imageUrl ?? null,
    }))

    return NextResponse.json(shops)
  } catch (error) {
    console.error('Failed to fetch map shops:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
