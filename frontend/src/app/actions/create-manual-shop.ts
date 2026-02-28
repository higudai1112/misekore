'use server'

import { pool } from '@/lib/db.server'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'

export async function createManualShop(formData: FormData) {
    // 1. セッション確認
    const session = await auth()
    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const userId = session.user.id || 'user-1'

    // 2. バリデーション
    const name = formData.get('name') as string
    const address = formData.get('address') as string
    const memo = formData.get('memo') as string || null

    if (!name || name.trim() === '') {
        throw new Error('Name is required')
    }
    if (!address || address.trim() === '') {
        throw new Error('Address is required')
    }

    // 3. Google Geocoding API呼び出し
    // ユーザーが手入力した文字列（住所）から緯度経度を取得し、Map上でピンを立てられるようにする
    let lat: number | null = null
    let lng: number | null = null

    const apiKey = process.env.GOOGLE_PLACES_SERVER_KEY
    if (apiKey) {
        try {
            const geocodeUrl = new URL('https://maps.googleapis.com/maps/api/geocode/json')
            geocodeUrl.searchParams.append('address', address)
            geocodeUrl.searchParams.append('key', apiKey)
            geocodeUrl.searchParams.append('language', 'ja')
            geocodeUrl.searchParams.append('region', 'jp')

            const response = await fetch(geocodeUrl.toString())
            if (response.ok) {
                const data = await response.json()
                if (data.status === 'OK' && data.results.length > 0) {
                    const location = data.results[0].geometry.location
                    lat = parseFloat(location.lat)
                    lng = parseFloat(location.lng)
                }
            } else {
                console.warn('Geocoding API failed:', response.statusText)
            }
        } catch (error) {
            console.error('Error fetching lat/lng from Geocoding API:', error)
            // Geocoding（緯度経度取得）に失敗しても、店舗の手入力登録自体はブロックせずに続行する
        }
    }

    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        // 4. ShopへINSERT
        // Google Places由来ではないため、placeIdはNULL、sourceは'manual'とする
        const finalShopId = randomUUID()
        await client.query(
            `
            INSERT INTO "Shop" (
                "id", "name", "address", "lat", "lng", "placeId", "source", "createdAt", "updatedAt"
            ) VALUES ($1, $2, $3, $4, $5, NULL, 'manual', NOW(), NOW())
            `,
            [finalShopId, name, address, lat, lng]
        )

        // 5. "UserShop" に INSERT
        // 店舗とユーザーを紐づけ、初期ステータスを'WANT'（行きたい）として登録
        await client.query(
            `
            INSERT INTO "UserShop" (
              "id", "shopId", "userId", "status", "memo", "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, 'WANT', $4, NOW(), NOW())
            `,
            [randomUUID(), finalShopId, userId, memo]
        )

        // 6. タグの登録処理
        const tags = formData.getAll('tags[]') as string[]
        if (tags && tags.length > 0) {
            for (const tagName of tags.slice(0, 5)) { // スパム・データ暴発防止のため最大5つまでに制限
                // 既存タグが存在するか検索する
                const tagRes = await client.query(
                    'SELECT "id" FROM "Tag" WHERE "name" = $1 LIMIT 1',
                    [tagName]
                )

                let tagId: string

                if (tagRes.rows.length > 0) {
                    tagId = tagRes.rows[0].id
                } else {
                    // 存在しない場合は新規にTagを発行
                    tagId = randomUUID()
                    await client.query(
                        'INSERT INTO "Tag" ("id", "name", "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())',
                        [tagId, tagName]
                    )
                }

                // 店舗とタグの紐付け(中間テーブル)を登録
                await client.query(
                    'INSERT INTO "ShopTag" ("id", "shopId", "tagId", "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())',
                    [randomUUID(), finalShopId, tagId]
                )
            }
        }

        await client.query('COMMIT')

    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Failed to create manual shop:', error)
        throw error
    } finally {
        client.release()
    }

    // 7. リダイレクト・再検証
    revalidatePath('/shops')
    redirect('/shops')
}
