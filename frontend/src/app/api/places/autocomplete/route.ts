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

        // 開発環境ではRateLimitを無効化
        if (process.env.NODE_ENV === 'production') {
            try {
                await limiter.check(100, ip)
            } catch {
                return NextResponse.json([], {
                    headers: { 'Cache-Control': 'no-store' },
                })
            }
        }

        const { searchParams } = new URL(request.url)
        const q = searchParams.get('q') || ''
        const sessiontoken = searchParams.get('sessiontoken')

        // 3文字未満の場合は空配列で返す (サジェスト不要)
        if (q.length < 3 || q.length > 64) {
            return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } })
        }

        // サーバー専用キーを使用（クライアント非露出）
        const apiKey = process.env.GOOGLE_PLACES_SERVER_KEY
        if (!apiKey) {
            console.error('GOOGLE_PLACES_SERVER_KEY is not defined')
            return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } })
        }

        // Google Places API (New) Autocomplete endpoint
        const url = 'https://places.googleapis.com/v1/places:autocomplete'

        const body: any = {
            input: q,
            languageCode: 'ja',
            regionCode: 'jp',
        }

        if (sessiontoken) {
            body.sessionToken = sessiontoken
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
            },
            body: JSON.stringify(body),
            cache: 'no-store',
        })

        if (!response.ok) {
            console.warn(`Places API returned ${response.status}:`, await response.text())
            // エラー時は空配列を返す (UI側で手入力を促す構成)
            return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } })
        }

        const data = await response.json()

        // New Places API のレスポンス形式をフロントエンドの構造にマッピング
        const formattedResults = (data.suggestions || [])
            .filter((s: any) => s.placePrediction)
            .map((s: any) => {
                const p = s.placePrediction
                return {
                    placeId: p.placeId || p.place || '',
                    primaryText: p.text?.text || p.structuredFormat?.mainText?.text || '',
                    secondaryText: p.structuredFormat?.secondaryText?.text || '',
                }
            })

        return NextResponse.json(formattedResults, {
            headers: {
                'Cache-Control': 'no-store',
            },
        })
    } catch (error) {
        console.error('Error in autocomplete proxy:', error)
        return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } })
    }
}
