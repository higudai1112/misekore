import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db.server'
import { checkApiDailyLimit, incrementApiCallCount } from '@/lib/daily-limit'

const limiter = rateLimit({
    interval: 60000,
    uniqueTokenPerInterval: 500,
})

// addressComponentsの型定義
type AddressComponent = {
    types: string[]
    longText: string
}

// Shopテーブルキャッシュ行の型定義
type ShopCacheRow = {
    id: string
    name: string
    address: string | null
    lat: number | null
    lng: number | null
    placeId: string | null
}

export async function GET(request: Request) {
    try {
        const ip =
            request.headers.get('x-forwarded-for')?.split(',')[0] ??
            request.headers.get('x-real-ip') ??
            'unknown'

        // 開発環境ではRateLimitを無効化（IPレートリミット: 30 req/min）
        if (process.env.NODE_ENV === 'production') {
            try {
                await limiter.check(30, ip) // 30 requests per minute
            } catch {
                return NextResponse.json(
                    { error: 'Rate limit exceeded' },
                    { status: 429, headers: { 'Cache-Control': 'no-store' } }
                )
            }
        }

        const { searchParams } = new URL(request.url)
        const placeId = searchParams.get('placeId')
        const sessiontoken = searchParams.get('sessiontoken')

        if (!placeId) {
            return NextResponse.json(
                { error: 'Missing placeId' },
                { status: 400, headers: { 'Cache-Control': 'no-store' } }
            )
        }

        // DBキャッシュチェック（placeIdでShopテーブルを検索）
        const cachedShops = await query<ShopCacheRow>(
            `SELECT id, name, address, lat, lng, "placeId" FROM "Shop" WHERE "placeId" = $1 LIMIT 1`,
            [placeId]
        )

        if (cachedShops.length > 0) {
            // DBキャッシュヒット: Google APIを呼ばず、日次カウントも消費しない
            const shop = cachedShops[0]
            return NextResponse.json(
                {
                    placeId: shop.placeId || placeId,
                    name: shop.name,
                    address: shop.address || '',
                    lat: shop.lat ?? null,
                    lng: shop.lng ?? null,
                },
                { headers: { 'Cache-Control': 'no-store' } }
            )
        }

        // ユーザー日次制限チェック（認証済みユーザーのみ）
        const session = await auth()
        if (session?.user?.id) {
            const withinLimit = await checkApiDailyLimit(session.user.id)
            if (!withinLimit) {
                return NextResponse.json(
                    { error: '1日のAPI利用上限に達しました' },
                    { status: 429, headers: { 'Cache-Control': 'no-store' } }
                )
            }
        }

        // サーバー専用キーを使用（クライアント非露出）
        const apiKey = process.env.GOOGLE_PLACES_SERVER_KEY
        if (!apiKey) {
            console.error('GOOGLE_PLACES_SERVER_KEY is not defined')
            return NextResponse.json(
                { error: 'Internal Server Error' },
                { status: 500, headers: { 'Cache-Control': 'no-store' } }
            )
        }

        // Google Places API (New) Details endpoint
        const baseUrl = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`
        const urlParams = new URLSearchParams()
        urlParams.set('languageCode', 'ja')
        if (sessiontoken) {
            urlParams.set('sessionToken', sessiontoken)
        }

        const url = `${baseUrl}?${urlParams.toString()}`

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Goog-Api-Key': apiKey,
                // 課金圧縮のため、必要なフィールドのみに制限
                'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,addressComponents',
            },
            cache: 'no-store',
        })

        if (!response.ok) {
            console.error('Places Details API Error:', await response.text())
            return NextResponse.json(
                { error: 'Places API request failed' },
                { status: 500, headers: { 'Cache-Control': 'no-store' } }
            )
        }

        const result = await response.json()

        // 住所整形用のユーティリティ関数
        const getFormattedJapaneseAddress = (
            addressComponents: AddressComponent[] | undefined,
            fallbackAddress: string
        ): string => {
            if (!addressComponents || !Array.isArray(addressComponents) || addressComponents.length === 0) {
                return fallbackAddress
            }

            const getComponent = (type: string) => {
                const comp = addressComponents.find((c: AddressComponent) => c.types.includes(type))
                return comp ? comp.longText : ''
            }

            const adminArea = getComponent('administrative_area_level_1')
            const locality = getComponent('locality')
            const subL1 = getComponent('sublocality_level_1')
            const subL2 = getComponent('sublocality_level_2')

            let address = `${adminArea}${locality}${subL1}${subL2}`

            // 丁目以下の番地・号などをハイフンで連結する
            // 例: subL3="6", subL4="47" -> "6-47"
            const subL3 = getComponent('sublocality_level_3')
            const subL4 = getComponent('sublocality_level_4')
            const subL5 = getComponent('sublocality_level_5')
            const streetNumber = getComponent('street_number')

            const blocks = [subL3, subL4, subL5, streetNumber].filter(Boolean)
            if (blocks.length > 0) {
                // すでにハイフンが含まれている場合はそのまま結合しないように調整するか、
                // 単純にハイフンでつなぐだけで良いか考える。日本の番地は通常ハイフン繋ぎが標準的
                address += blocks.join('-')
            }

            // route (通り名) はすでに含まれていない場合のみ付与
            const route = getComponent('route')
            if (route && !address.includes(route)) {
                address += route
            }

            // 建物名・部屋番号 (premise, subpremise)
            const premise = getComponent('premise')
            const subpremise = getComponent('subpremise')

            if (premise) {
                address += ` ${premise}`
            }
            if (subpremise) {
                address += premise ? ` ${subpremise}` : ` ${subpremise}`
            }

            return address || fallbackAddress
        }

        const cleanAddress = getFormattedJapaneseAddress(result.addressComponents, result.formattedAddress || '')

        // クライアントが必要とする形式にマッピング
        const formattedResult = {
            placeId: result.id || placeId,
            name: result.displayName?.text || '',
            address: cleanAddress,
            lat: result.location?.latitude ?? null,
            lng: result.location?.longitude ?? null,
        }

        // Shopテーブルにキャッシュ保存（placeIdにUNIQUE制約なしのためSELECT-first→INSERT）
        // INSERT失敗はサイレント（レスポンスを妨げない）
        try {
            const existing = await query<{ id: string }>(
                `SELECT id FROM "Shop" WHERE "placeId" = $1 LIMIT 1`,
                [formattedResult.placeId]
            )
            if (existing.length === 0) {
                await query(
                    `INSERT INTO "Shop" (id, name, address, lat, lng, "placeId", source, "createdAt", "updatedAt")
                     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'google', NOW(), NOW())`,
                    [formattedResult.name, formattedResult.address, formattedResult.lat, formattedResult.lng, formattedResult.placeId]
                )
            }
        } catch (err) {
            // キャッシュ保存失敗はサイレントに無視（レスポンスには影響しない）
            console.warn('Failed to cache shop to DB:', err)
        }

        // Google APIを実際に呼んだ後のみ日次カウントを消費
        if (session?.user?.id) {
            await incrementApiCallCount(session.user.id)
        }

        return NextResponse.json(formattedResult, {
            headers: {
                'Cache-Control': 'no-store',
            },
        })
    } catch (error) {
        console.error('Error in details proxy:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500, headers: { 'Cache-Control': 'no-store' } }
        )
    }
}
