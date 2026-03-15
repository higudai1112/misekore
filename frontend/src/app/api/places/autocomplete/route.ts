import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { auth } from '@/lib/auth'
import { checkApiDailyLimit, incrementApiCallCount } from '@/lib/daily-limit'

const limiter = rateLimit({
    interval: 60000,
    uniqueTokenPerInterval: 500,
})

// オートコンプリート結果のインメモリキャッシュ（TTL: 30秒）
const autocompleteCache = new Map<string, { data: unknown; expiresAt: number }>()

// Google Places Autocomplete APIのレスポンス候補の型
type Suggestion = {
    placeId: string
    primaryText: string
    secondaryText: string
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
                await limiter.check(30, ip)
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

        // インメモリキャッシュをチェック（TTL: 30秒）
        const cacheKey = `autocomplete:${q}`
        const cached = autocompleteCache.get(cacheKey)
        if (cached && cached.expiresAt > Date.now()) {
            // キャッシュヒット: 日次カウントを消費せず即return
            return NextResponse.json(cached.data, { headers: { 'Cache-Control': 'no-store' } })
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
            return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } })
        }

        // Google Places API (New) Autocomplete endpoint
        const url = 'https://places.googleapis.com/v1/places:autocomplete'

        const body: Record<string, unknown> = {
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
        const formattedResults: Suggestion[] = (data.suggestions || [])
            .filter((s: Record<string, unknown>) => s.placePrediction)
            .map((s: Record<string, unknown>) => {
                const p = s.placePrediction as Record<string, unknown>
                const text = p.text as Record<string, unknown> | undefined
                const structuredFormat = p.structuredFormat as Record<string, unknown> | undefined
                const mainText = structuredFormat?.mainText as Record<string, unknown> | undefined
                const secondaryText = structuredFormat?.secondaryText as Record<string, unknown> | undefined
                return {
                    placeId: (p.placeId as string) || (p.place as string) || '',
                    primaryText: (text?.text as string) || (mainText?.text as string) || '',
                    secondaryText: (secondaryText?.text as string) || '',
                }
            })

        // キャッシュに保存（TTL: 30秒）
        autocompleteCache.set(cacheKey, { data: formattedResults, expiresAt: Date.now() + 30000 })

        // Google APIを実際に呼んだ後のみ日次カウントを消費
        if (session?.user?.id) {
            await incrementApiCallCount(session.user.id)
        }

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
