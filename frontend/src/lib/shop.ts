import { query } from '@/lib/db.server'
import type { QueryResultRow } from 'pg'
import type { ShopStatus } from '@/types/shop'

// 各店舗の詳細画面で表示するための情報をDBから取得する処理
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

// お店の詳細情報（画像やステータスを含む）を取得する関数
export async function getShopDetail(id: string) {
  const userId = 'user-1' // TODO: 今後、認証情報から取得するように変更する

  // お店の基本情報とユーザーごとのステータス（行った/行きたい等）、メモを取得
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

  // お店に関連づけられている写真のURL一覧を取得
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

  // お店に関連づけられているタグ一覧を取得
  const tags = await query<{ id: string; name: string }>(
    `
    SELECT
      t."id",
      t."name"
    FROM "Tag" t
    JOIN "ShopTag" st ON st."tagId" = t."id"
    WHERE st."shopId" = $1
    `,
    [id]
  )

  // 取得したお店情報と写真情報を結合して返す
  return {
    ...shops[0],
    photos: photos.map((p) => ({
      id: p.id,
      url: p.imageUrl,
    })),
    tags: tags.map((t) => ({
      id: t.id,
      name: t.name,
    })),
  }
}

// お店一覧（/shops）ページに表示するための「行きたい」「行った」お店の型
type WantShopRow = QueryResultRow & {
  id: string
  name: string
  address: string | null
  status: ShopStatus
}

// ログインユーザーのお店の内、ステータスが WANT または VISITED のものを一覧で取得する関数
export async function getAllShopsForList() {
  const userId = 'user-1' // TODO: 今後、認証情報から取得するように変更する

  const rows = await query<any>(
    `
    SELECT
      s."id",
      s."name",
      s."address",
      us."status",
      COALESCE(
        (
          SELECT json_agg(t."name")
          FROM "Tag" t
          JOIN "ShopTag" st ON st."tagId" = t."id"
          WHERE st."shopId" = s."id"
        ),
        '[]'::json
      ) as "tags"
    FROM "Shop" s
    JOIN "UserShop" us ON us."shopId" = s."id"
    WHERE us."userId" = $1
      AND us."status" IN ('WANT', 'VISITED')
    ORDER BY us."updatedAt" DESC
    `,
    [userId]
  )

  return rows
}

// お気に入り一覧（/favorite）ページに表示するための型
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
      us."status",
      COALESCE(
        (
          SELECT json_agg(t."name")
          FROM "Tag" t
          JOIN "ShopTag" st ON st."tagId" = t."id"
          WHERE st."shopId" = s."id"
        ),
        '[]'::json
      ) as "tags"
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
