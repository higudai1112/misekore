"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"
import { useRouter } from "next/navigation"

declare global {
    interface Window {
        google: unknown
    }
}

interface ShopMarker {
    id: string
    name: string
    lat: number
    lng: number
    status: "WANT" | "VISITED" | "FAVORITE"
}

export function ShopMap() {
    const router = useRouter()

    // マップを描画するためのDOM要素への参照
    const mapRef = useRef<HTMLDivElement>(null)
    // 初期化済みのGoogle Mapインスタンスを保持する参照（二重初期化防止用）
    const mapInstanceRef = useRef<unknown>(null)
    // 現在開いているカスタムポップアップ要素とその削除関数を保持（常に1つだけ表示するため）
    const activePopupRef = useRef<{ marker: unknown; removePopup: () => void } | null>(null)

    const [shops, setShops] = useState<ShopMarker[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isApiLoaded, setIsApiLoaded] = useState(false)

    // Next.jsのSPA遷移（画面遷移）で戻ってきた際にScriptがすでに読み込み済みの場合の対策
    useEffect(() => {
        const googleGlobal = typeof window !== "undefined" ? (window.google as any) : null
        if (googleGlobal?.maps?.importLibrary) {
            setIsApiLoaded(true)
        }
    }, [])

    // 店舗データAPI取得
    useEffect(() => {
        let isMounted = true

        const fetchShops = async () => {
            try {
                const res = await fetch("/api/map/shops")
                if (!res.ok) {
                    throw new Error("店舗データの取得に失敗しました")
                }
                const data = await res.json()
                if (isMounted) {
                    setShops(data)
                }
            } catch (err: unknown) {
                if (!isMounted) return
                if (err instanceof Error) {
                    setError(err.message)
                } else {
                    setError("不明なエラーが発生しました")
                }
            }
        }
        fetchShops()

        return () => {
            isMounted = false
        }
    }, [])

    // マップ初期化処理
    useEffect(() => {
        if (!isApiLoaded || !mapRef.current) return

        let isMounted = true

        const initMap = async () => {
            try {
                // ==========================================
                // 1. Google Maps ライブラリの動的インポート
                // ==========================================
                const googleGlobal = window.google as any
                // google.maps.importLibrary があるか確認
                if (!googleGlobal?.maps?.importLibrary) {
                    throw new Error("Google Maps APIが正しく初期化できませんでした")
                }

                // importLibraryを使用して新API形式でモジュールを展開
                const mapsLibrary = await googleGlobal.maps.importLibrary("maps")
                const markerLibrary = await googleGlobal.maps.importLibrary("marker")

                const { Map } = mapsLibrary
                const { AdvancedMarkerElement, PinElement } = markerLibrary

                // ==========================================
                // 2. マップ自体の初期化処理
                // ==========================================
                // StrictMode対策（二重初期化を防ぐ）
                if (!mapInstanceRef.current && isMounted) {
                    // デフォルトの初期表示（東京駅周辺等）
                    const defaultCenter = { lat: 35.681236, lng: 139.767125 }

                    const map = new Map(mapRef.current!, {
                        center: defaultCenter,
                        zoom: 12,
                        mapId: "MISEKORE_MAP_ID", // AdvancedMarkerElementに必要
                        disableDefaultUI: true,   // MVPでUIをすっきりさせる
                        zoomControl: true,
                        gestureHandling: "greedy", // モバイル操作を自然にするため
                    })
                    mapInstanceRef.current = map

                    // マップ上（ピン以外）をクリックしたらポップアップを閉じる
                    map.addListener("click", () => {
                        if (activePopupRef.current) {
                            activePopupRef.current.removePopup()
                            activePopupRef.current = null
                        }
                    })

                    // マップ初期化直後に現在地を取得して移動する機能を自動実行
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                if (mapInstanceRef.current) {
                                    const mapObj = mapInstanceRef.current as any
                                    mapObj.setCenter({
                                        lat: position.coords.latitude,
                                        lng: position.coords.longitude,
                                    })
                                    mapObj.setZoom(14)
                                }
                            },
                            (err) => {
                                console.warn("初期位置情報の取得に失敗しました。デフォルトの場所を表示します:", err)
                            },
                            {
                                enableHighAccuracy: false, // 初回取得は速度優先
                                timeout: 5000,
                            }
                        )
                    }
                }

                const map = mapInstanceRef.current
                if (!map) return

                // ==========================================
                // 3. 店舗マーカーとカスタムポップアップの生成
                // ==========================================
                shops.forEach((shop) => {
                    // 店舗ステータスに応じたピン（AdvancedMarkerElement）のカラー設定
                    let background = "#cbd5e1" // VISITED (gray-300)
                    let borderColor = "#94a3b8" // gray-400
                    const glyphColor = "#ffffff"

                    if (shop.status === "WANT") {
                        background = "#3b82f6" // blue-500
                        borderColor = "#2563eb" // blue-600
                    } else if (shop.status === "FAVORITE") {
                        background = "#ef4444" // red-500
                        borderColor = "#dc2828" // red-600
                    }

                    const pin = new PinElement({
                        background,
                        borderColor,
                        glyphColor,
                    })

                    // AdvancedMarkerElementのcontentに指定するコンテナを作成
                    const container = document.createElement("div")
                    container.style.position = "relative"
                    container.style.cursor = "pointer"
                    container.appendChild(pin.element)

                    const marker = new AdvancedMarkerElement({
                        map,
                        position: { lat: shop.lat, lng: shop.lng },
                        title: shop.name,
                        content: container,
                    })

                    const mapObj = map as any
                    const markerObj = marker as any

                    let currentPopup: HTMLDivElement | null = null

                    // このマーカーのポップアップを閉じる処理
                    const removePopup = () => {
                        if (currentPopup && container.contains(currentPopup)) {
                            container.removeChild(currentPopup)
                            currentPopup = null
                            markerObj.zIndex = null // z-indexをリセット
                        }
                    }

                    markerObj.addListener("click", () => {
                        // 既に別のポップアップが開いていれば閉じる（常に1つのみ表示）
                        if (activePopupRef.current && activePopupRef.current.marker !== markerObj) {
                            activePopupRef.current.removePopup()
                        }

                        // 自分自身がすでに開いているなら閉じる（トグル動作）
                        if (currentPopup) {
                            removePopup()
                            activePopupRef.current = null
                            return
                        }

                        // 最前面に表示する
                        markerObj.zIndex = 9999

                        // ----------------------------------------
                        // DOM要素を使用してカスタムHTMLポップアップを組み立てる
                        // （InfoWindowは使わず、div要素で自由にデザイン）
                        // ----------------------------------------
                        const popup = document.createElement("div")
                        // Tailwindクラス適用: 幅240px, 白背景, 丸角xl, 影lg, hoverで微変化
                        popup.className = "absolute bottom-full left-1/2 mb-3 flex w-[240px] -translate-x-1/2 cursor-pointer items-center justify-between rounded-xl bg-white p-3 shadow-lg ring-1 ring-black/5 transition-all hover:bg-gray-50 active:scale-95"

                        // ポップアップクリックで詳細画面へ遷移
                        popup.addEventListener("click", (e) => {
                            e.stopPropagation() // マップのクリックイベントが発火しないようにする
                            router.push(`/shops/${shop.id}`)
                        })

                        // 左側（テキストコンテナ）
                        const textContainer = document.createElement("div")
                        textContainer.className = "flex flex-col gap-1 overflow-hidden"

                        // 店名表示
                        const nameEl = document.createElement("div")
                        nameEl.className = "truncate text-[15px] font-semibold text-gray-900"
                        nameEl.textContent = shop.name

                        // ステータス表示
                        const statusEl = document.createElement("div")
                        let statusColorClass = ""
                        let statusText = ""
                        if (shop.status === "WANT") {
                            statusColorClass = "text-blue-600"
                            statusText = "行きたい"
                        } else if (shop.status === "VISITED") {
                            statusColorClass = "text-gray-500"
                            statusText = "行った"
                        } else if (shop.status === "FAVORITE") {
                            statusColorClass = "text-red-600"
                            statusText = "お気に入り"
                        }
                        statusEl.className = `text-xs font-medium ${statusColorClass}`
                        statusEl.textContent = statusText

                        textContainer.appendChild(nameEl)
                        textContainer.appendChild(statusEl)

                        // 右側（→アイコン）
                        const iconContainer = document.createElement("div")
                        iconContainer.className = "ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400"
                        // 右矢印アイコン
                        iconContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>`

                        popup.appendChild(textContainer)
                        popup.appendChild(iconContainer)

                        // ピンのコンテナに追加する
                        container.appendChild(popup)
                        currentPopup = popup

                        // 状態を保持
                        activePopupRef.current = { marker: markerObj, removePopup }
                    })
                })
            } catch (err) {
                console.error("Error loading Google Maps", err)
                if (isMounted) {
                    setError("マップの描画に失敗しました。コンソールをご確認ください。")
                }
            }
        }

        // shopsが0件でもマップを描画する（最低でも日本地図は出しておくように制御）
        if (shops.length >= 0) {
            initMap()
        }

        return () => {
            isMounted = false
        }
    }, [shops, isApiLoaded, router])

    // 現在地を取得してマップを移動する
    const handleCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("お使いのブラウザは位置情報をサポートしていません")
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                if (mapInstanceRef.current) {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    }
                    const mapObj = mapInstanceRef.current as any
                    mapObj.setCenter(pos)
                    mapObj.setZoom(15) // 現在地の場合はズームを上げる
                }
            },
            (err) => {
                console.error("Geolocation error:", err)
                let message = "位置情報の取得に失敗しました"
                if (err.code === 1) message = "位置情報の利用が許可されていません"
                if (err.code === 2) message = "現在地を特定できませんでした"
                if (err.code === 3) message = "タイムアウトしました"
                alert(message)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        )
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
        return (
            <div className="flex h-[calc(100vh-140px)] w-full items-center justify-center rounded-xl bg-gray-100 p-4 text-center">
                <p className="font-semibold text-red-500">Google Maps API Keyが設定されていません</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-[calc(100vh-140px)] w-full items-center justify-center rounded-xl bg-gray-100 p-4 text-center">
                <p className="font-semibold text-red-500">{error}</p>
            </div>
        )
    }

    return (
        <div className="relative h-[calc(100vh-140px)] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm">
            {/* 外部パッケージを介さず Google Maps JavaScript API を直接読み込む */}
            <Script
                src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`}
                strategy="afterInteractive"
                onLoad={() => setIsApiLoaded(true)}
                onError={() => setError("Google Maps APIの読み込みに失敗しました")}
            />

            {/* 現在地取得ボタン（MVP） */}
            <button
                onClick={handleCurrentLocation}
                className="absolute bottom-4 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="現在地を表示"
                title="現在地を表示"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6 text-gray-700"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                    />
                </svg>
            </button>

            {/* マップ描画コンテナ */}
            <div ref={mapRef} className="h-full w-full" />
        </div>
    )
}
