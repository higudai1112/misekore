'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

interface ShopDetailMapProps {
    latitude: number
    longitude: number
    shopName: string
}

export function ShopDetailMap({ latitude, longitude, shopName }: ShopDetailMapProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<unknown>(null)
    const [error, setError] = useState<string | null>(null)
    const [isApiLoaded, setIsApiLoaded] = useState(false)

    // Next.jsのSPA遷移で戻ってきた際にScriptがすでに読み込み済みの場合の対策
    useEffect(() => {
        const googleGlobal = typeof window !== 'undefined' ? (window as any).google : null
        if (googleGlobal?.maps?.importLibrary) {
            setIsApiLoaded(true)
        }
    }, [])

    useEffect(() => {
        if (!isApiLoaded || !mapRef.current) return

        let isMounted = true

        const initMap = async () => {
            try {
                const googleGlobal = (window as any).google
                if (!googleGlobal?.maps?.importLibrary) {
                    throw new Error('Google Maps APIが正しく初期化できませんでした')
                }

                // importLibraryを使用して新API形式でモジュールを展開
                const mapsLibrary = await googleGlobal.maps.importLibrary('maps')
                const markerLibrary = await googleGlobal.maps.importLibrary('marker')

                const { Map } = mapsLibrary
                const { AdvancedMarkerElement, PinElement } = markerLibrary

                if (!mapInstanceRef.current && isMounted) {
                    const position = { lat: latitude, lng: longitude }

                    const map = new Map(mapRef.current!, {
                        center: position,
                        zoom: 14,
                        mapId: 'MISEKORE_DETAIL_MAP_ID',
                        disableDefaultUI: true,
                        zoomControl: true,
                        gestureHandling: 'greedy',
                    })

                    mapInstanceRef.current = map

                    // misekore風の丸みと色合いを持つピン
                    const pin = new PinElement({
                        background: '#8fae8f', // テーマカラー
                        borderColor: '#7b997b',
                        glyphColor: '#ffffff',
                    })

                    new AdvancedMarkerElement({
                        map,
                        position,
                        content: pin.element,
                        title: shopName,
                    })
                }
            } catch (err) {
                console.error('Failed to load map', err)
                if (isMounted) setError('マップの描画に失敗しました')
            }
        }

        initMap()

        return () => {
            isMounted = false
        }
    }, [isApiLoaded, latitude, longitude, shopName])

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
        return (
            <div className="flex h-64 sm:h-[280px] w-full items-center justify-center rounded-2xl bg-gray-50 p-4 text-center ring-1 ring-black/5">
                <p className="font-semibold text-red-500">Google Maps API Keyが設定されていません</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-64 sm:h-[280px] w-full items-center justify-center rounded-2xl bg-gray-50 p-4 text-center ring-1 ring-black/5">
                <p className="font-semibold text-red-500">{error}</p>
            </div>
        )
    }

    return (
        <div className="relative h-64 sm:h-[280px] w-full overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 bg-gray-50">
            {/* 外部パッケージを介さず Google Maps JavaScript API を直接読み込む */}
            <Script
                src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`}
                strategy="afterInteractive"
                onLoad={() => setIsApiLoaded(true)}
                onError={() => setError("Google Maps APIの読み込みに失敗しました")}
            />

            <div ref={mapRef} className="h-full w-full" />
        </div>
    )
}
