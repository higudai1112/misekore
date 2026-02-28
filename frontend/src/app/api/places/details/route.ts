import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

const limiter = rateLimit({
    interval: 60000,
    uniqueTokenPerInterval: 500,
})

export async function GET(request: Request) {
    try {
        const ip =
            request.headers.get('x-forwarded-for')?.split(',')[0] ??
            request.headers.get('x-real-ip') ??
            'unknown'

        if (process.env.NODE_ENV === 'production') {
            try {
                await limiter.check(100, ip) // 100 requests per minute
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
            addressComponents: any[] | undefined,
            fallbackAddress: string
        ): string => {
            if (!addressComponents || !Array.isArray(addressComponents) || addressComponents.length === 0) {
                return fallbackAddress
            }

            const getComponent = (type: string) => {
                const comp = addressComponents.find((c: any) => c.types.includes(type))
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
