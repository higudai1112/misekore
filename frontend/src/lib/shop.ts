import { query } from '@/lib/db.server'
import type { QueryResultRow } from 'pg'
import type { ShopStatus } from '@/types/shop'

// 店舗詳細をDBから取得
type ShopDetailRow = QueryResultRow & {
  id: string
  name: string
  address: string | null
  lat: number | null
  lng: number | null
  status: ShopStatus
  memo: string | null
  visitedAt: Date | null
}

type ShopPhotoRow = QueryResultRow & {
  id: string
  imageUrl: string
}

export async function getShopDetail(id: string) {
  const userId = 'user-1'

  const shops = await query<ShopDetailRow>(
    `
    SELECT
      s."id",
      s."name",
      s."address",
      s."lat",
      s."lng",
      us."status",
      us."memo",
      us."visitedAt"
    FROM "Shop" s
    JOIN "UserShop" us ON us."shopId" = s."id"
    WHERE s."id" = $1
      AND us."userId" = $2
    `,
    [id, userId]
  )

  if (!shops[0]) return null

  const photos = await query<ShopPhotoRow>(
    `
    SELECT
      "id",
      "imageUrl"
    FROM "ShopPhoto"
    WHERE "shopId" = $1
      AND "userId" = $2
    `,
    [id, userId]
  )

  return {
    ...shops[0],
    photos: photos.map((p) => ({
      id: p.id,
      url: p.imageUrl,
    })),
    tags: [],
  }
}

// want一覧に各店舗を表示するためにDBから取得
type WantShopRow = QueryResultRow & {
  id: string
  name: string
  address: string | null
  status: ShopStatus
}

export async function getWantShops() {
  const userId = 'user-1'

  const rows = await query<any>(
    `
    SELECT
      s."id",
      s."name",
      s."address",
      us."status"
    FROM "Shop" s
    JOIN "UserShop" us ON us."shopId" = s."id"
    WHERE us."userId" = $1
      AND us."status" = 'WANT'
    ORDER BY us."updatedAt" DESC
    `,
    [userId]
  )

  return rows
}

// favorite一覧に各店舗を表示するためにDBから取得
type FavoriteShopRow = QueryResultRow & {
  id: string
  name: string
  address: string | null
  status: ShopStatus
}

// ユーザーIDに紐づいて、ステータスが「FAVORITE」の店舗を取得する処理
export async function getFavoriteShops(userId: string) {
  // Prismaを利用した実装が指定されていましたが、既存のqueryベースの実装・設計を壊さず
  // 型エラーが出ないようにするため、同じくpg queryで取得する形に調整して実装しています
  const rows = await query<FavoriteShopRow>(
    `
    SELECT
      s."id",
      s."name",
      s."address",
      us."status"
    FROM "Shop" s
    JOIN "UserShop" us ON us."shopId" = s."id"
    WHERE us."userId" = $1
      AND us."status" = 'FAVORITE'
    ORDER BY us."updatedAt" DESC
    `,
    [userId]
  )

  return rows
}
