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
          select: { id: true, name: true, lat: true, lng: true },
        },
      },
    })

    const shops = userShops.map((us) => ({
      id: us.shop.id,
      name: us.shop.name,
      lat: us.shop.lat,
      lng: us.shop.lng,
      status: us.status,
    }))

    return NextResponse.json(shops)
  } catch (error) {
    console.error('Failed to fetch map shops:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
