import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db.server"
import type { QueryResultRow } from "pg"

interface MapShopRow extends QueryResultRow {
    id: string
    name: string
    lat: number
    lng: number
    status: "WANT" | "VISITED" | "FAVORITE"
}

// GETリクエストを処理するAPIエンドポイント
export async function GET() {
    try {
        // 1. セッション（認証情報）の取得
        // 未ログインユーザーのアクセスを防ぐための保護処理
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // ログイン中のユーザーIDを取得
        const userId = session.user.id

        // TODO: ローカルテスト用のフォールバック（本番稼働時は削除・修正が必要）
        const targetUserId = userId || "user-1"

        // 2. データベースから店舗情報を取得
        // ログインユーザーが登録した（"UserShop" に存在する）店舗のうち、
        // 緯度(lat)・経度(lng)がNULLではない（＝マップに表示できる）店舗のみを結合して取得
        // ※pgを使用しており、大文字小文字を区別するテーブル名・カラム名はダブルクォートで囲む
        const shops = await query<MapShopRow>(
            `
            SELECT 
                s."id",
                s."name",
                s."lat",
                s."lng",
                us."status"
            FROM "Shop" s
            JOIN "UserShop" us ON s."id" = us."shopId"
            WHERE us."userId" = $1
              AND s."lat" IS NOT NULL
              AND s."lng" IS NOT NULL
            `,
            [targetUserId] // $1 に targetUserId をバインド（SQLインジェクション対策）
        )

        // 3. 取得したデータをJSON形式でクライアントに返却
        return NextResponse.json(shops)
    } catch (error) {
        console.error("Failed to fetch map shops:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
