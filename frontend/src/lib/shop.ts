import { prisma } from '@/lib/prisma'

// お店詳細ページで表示するデータを取得する
// userId を引数で受け取ることで user-1 ハードコードを排除
export async function getShopDetail(id: string, userId: string) {
  const userShop = await prisma.userShop.findUnique({
    where: { userId_shopId: { userId, shopId: id } },
    include: {
      shop: {
        include: {
          shopPhotos: { where: { userId } },
          shopTags: { include: { tag: true } },
        },
      },
    },
  })

  if (!userShop) return null

  return {
    id: userShop.shop.id,
    name: userShop.shop.name,
    address: userShop.shop.address,
    lat: userShop.shop.lat,
    lng: userShop.shop.lng,
    status: userShop.status,
    rating: userShop.rating,
    memo: userShop.memo,
    visitedAt: userShop.visitedAt,
    photos: userShop.shop.shopPhotos.map((p) => ({
      id: p.id,
      url: p.imageUrl,
    })),
    tags: userShop.shop.shopTags.map((st) => ({
      id: st.tag.id,
      name: st.tag.name,
    })),
  }
}

// お店一覧（/shops）に表示する WANT / VISITED のお店を取得する
// userId を引数で受け取ることで user-1 ハードコードを排除
// query が指定された場合、お店名・住所で絞り込む
export async function getAllShopsForList(userId: string, query?: string) {
  const userShops = await prisma.userShop.findMany({
    where: {
      userId,
      status: { in: ['WANT', 'VISITED'] },
      ...(query
        ? {
            shop: {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { address: { contains: query, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      shop: {
        include: {
          shopTags: { include: { tag: true } },
        },
      },
    },
  })

  return userShops.map((us) => ({
    id: us.shop.id,
    name: us.shop.name,
    address: us.shop.address,
    status: us.status,
    tags: us.shop.shopTags.map((st) => st.tag.name),
  }))
}

// お気に入り一覧（/favorite）に表示する FAVORITE のお店を取得する
export async function getFavoriteShops(userId: string) {
  const userShops = await prisma.userShop.findMany({
    where: { userId, status: 'FAVORITE' },
    orderBy: { updatedAt: 'desc' },
    include: {
      shop: {
        include: {
          shopTags: { include: { tag: true } },
        },
      },
    },
  })

  return userShops.map((us) => ({
    id: us.shop.id,
    name: us.shop.name,
    address: us.shop.address,
    status: us.status,
    tags: us.shop.shopTags.map((st) => st.tag.name),
  }))
}
