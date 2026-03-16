'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Prediction {
    placeId: string
    primaryText: string
    secondaryText: string
}

interface PlaceDetails {
    placeId: string
    name: string
    address: string | null
    lat: number | null
    lng: number | null
}

const MAX_FETCH_COUNT = 10

export function PlaceSearchInput() {
    // UI State
    const [query, setQuery] = useState('')
    const [candidates, setCandidates] = useState<Prediction[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isDetailsLoading, setIsDetailsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    // Hidden Input State (DB保存用)
    const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null)

    // Refs
    const containerRef = useRef<HTMLDivElement>(null)
    const sessionTokenRef = useRef<string | null>(null)
    const fetchCountRef = useRef(0)
    const abortControllerRef = useRef<AbortController | null>(null)
    const isComposingRef = useRef(false)

    // キーボード操作用の選択インデックス
    const [activeIndex, setActiveIndex] = useState(-1)

    // マウント時に sessionToken を生成
    useEffect(() => {
        sessionTokenRef.current = crypto.randomUUID()
    }, [])

    // Outside Click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchAutocomplete = useCallback(async (searchText: string) => {
        if (searchText.length < 3) {
            setCandidates([])
            setIsOpen(false)
            return
        }

        // 制限回数チェック
        if (fetchCountRef.current >= MAX_FETCH_COUNT) {
            setCandidates([])
            setIsOpen(false)
            return
        }

        setIsLoading(true)
        setErrorMsg('')

        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
        abortControllerRef.current = new AbortController()

        try {
            fetchCountRef.current += 1
            const params = new URLSearchParams()
            params.set('q', searchText)
            if (sessionTokenRef.current) {
                params.set('sessiontoken', sessionTokenRef.current)
            }

            const res = await fetch(`/api/places/autocomplete?${params.toString()}`, {
                signal: abortControllerRef.current.signal,
            })

            if (!res.ok) {
                console.warn('Autocomplete API returned non-OK status')
                setCandidates([])
                return
            }

            const data: Prediction[] = await res.json()
            setCandidates(data)
            setIsOpen(data.length > 0)
            setActiveIndex(-1)
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Autocomplete API error:', error)
                setErrorMsg('候補を取得できませんでした。手入力してください')
                setCandidates([])
                setIsOpen(false)
            }
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Debounce: queryが変化してから 300ms 後にfetch
    useEffect(() => {
        const handler = setTimeout(() => {
            if (!isComposingRef.current) {
                // queryがdetailsのnameと同じ場合は、選択直後なのでfetchしない
                if (placeDetails && query === placeDetails.name) {
                    return
                }
                fetchAutocomplete(query)
            }
        }, 300)

        // クリーンアップ関数
        return () => {
            clearTimeout(handler)
        }
    }, [query, fetchAutocomplete, placeDetails])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value
        setQuery(newQuery)

        // もし候補選択後にユーザーが手入力で変更した場合、hidden データをクリアする（不整合防止）
        if (placeDetails && newQuery !== placeDetails.name) {
            setPlaceDetails(null)
        }
    }

    const handleCompositionStart = () => {
        isComposingRef.current = true
    }

    const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
        isComposingRef.current = false
        // IME確定後に即時fetchを開始したい場合はここで呼ぶ
        const val = (e.target as HTMLInputElement).value

        if (placeDetails && val === placeDetails.name) return
        fetchAutocomplete(val)
    }

    const handleSelect = async (placeId: string) => {
        if (isDetailsLoading) return

        setIsDetailsLoading(true)
        setIsOpen(false)
        setErrorMsg('')

        try {
            const params = new URLSearchParams()
            params.set('placeId', placeId)
            if (sessionTokenRef.current) {
                params.set('sessiontoken', sessionTokenRef.current)
            }

            const res = await fetch(`/api/places/details?${params.toString()}`)

            if (!res.ok) {
                throw new Error('Details fetch failed')
            }

            const data: PlaceDetails = await res.json()

            // UI上の入力欄を選択した店名で上書き
            setQuery(data.name)
            // hidden input 用のstateを更新
            setPlaceDetails(data)

            // sessionTokenのローテーション（1回の検索セッション終了のため）
            sessionTokenRef.current = crypto.randomUUID()

        } catch (error) {
            console.error('Details API error:', error)
            setErrorMsg('詳細を取得できませんでした。そのまま手入力で保存してください。')
        } finally {
            setIsDetailsLoading(false)
            setCandidates([]) // リストをクリア
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen || candidates.length === 0) return

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex((prev) => (prev < candidates.length - 1 ? prev + 1 : prev))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev))
        } else if (e.key === 'Enter') {
            // IME変換中のEnter(確定)の場合は、候補選択を防ぐ
            if (isComposingRef.current) return

            if (activeIndex >= 0 && activeIndex < candidates.length) {
                e.preventDefault()
                handleSelect(candidates[activeIndex].placeId)
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false)
        }
    }

    return (
        <div className="relative w-full" ref={containerRef}>
            {/* 隠しインプット (Server Action 送信用) */}
            <input type="hidden" name="placeId" value={placeDetails?.placeId || ''} />
            <input type="hidden" name="address" value={placeDetails?.address || ''} />
            <input type="hidden" name="lat" value={placeDetails?.lat?.toString() || ''} />
            <input type="hidden" name="lng" value={placeDetails?.lng?.toString() || ''} />

            <input
                type="text"
                id="name"
                name="name" // 本体の名前は既存のまま (手入力だけでも保存可能にするため)
                required
                value={query}
                onChange={handleInputChange}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                    if (candidates.length > 0) setIsOpen(true)
                }}
                className="w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 outline-none ring-1 ring-inset ring-gray-300 focus:bg-white focus:ring-2 focus:ring-[#8fae8f]"
                placeholder="店名を入力 (例: カフェ・ド・パリ)"
                autoComplete="off"
            />

            {(isLoading || isDetailsLoading) && (
                <div className="absolute right-3 top-2.5 text-xs text-gray-400">
                    検索中...
                </div>
            )}

            {errorMsg && (
                <div className="mt-1 text-xs text-red-500">{errorMsg}</div>
            )}

            {/* 10回制限に達した場合 または 候補が0件の場合のメッセージ */}
            {query.length >= 3 && !isOpen && !isLoading && !isDetailsLoading && !placeDetails && (
                <div className="mt-2 text-sm text-gray-600 flex flex-col gap-2">
                    {fetchCountRef.current >= MAX_FETCH_COUNT ? (
                        <span>※ 検索上限に達しました。</span>
                    ) : (
                        <span>Googleの検索結果に見つかりませんでした。</span>
                    )}
                    <a
                        href="/shops/new?mode=manual"
                        className="text-blue-500 hover:text-blue-700 font-medium w-fit underline underline-offset-2"
                    >
                        ＋ 手入力で登録する
                    </a>
                </div>
            )}

            {isOpen && candidates.length > 0 && (
                <ul
                    className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                    role="listbox"
                >
                    {candidates.map((c, index) => (
                        <li
                            key={c.placeId}
                            role="option"
                            aria-selected={activeIndex === index}
                            onClick={() => handleSelect(c.placeId)}
                            className={`relative cursor-pointer select-none py-2 pl-3 pr-9 border-b border-gray-100 last:border-b-0
                                ${activeIndex === index ? 'bg-[#8fae8f] text-white' : 'text-gray-900 hover:bg-[#e6efe6] hover:text-[#4f6f4f]'}
                            `}
                        >
                            <div className="flex flex-col">
                                <span className="font-semibold">{c.primaryText}</span>
                                <span className={`text-xs ${activeIndex === index ? 'text-gray-200' : 'text-gray-500'}`}>
                                    {c.secondaryText}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
