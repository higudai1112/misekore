'use client'

import { useState, useEffect } from 'react'
import { RestaurantCard, type Restaurant } from './restaurant-card'

type TagFilteredShopListProps = {
    shops: Restaurant[]
    children?: React.ReactNode // For injecting tabs or other headers above the tags
}

export function TagFilteredShopList({ shops, children }: TagFilteredShopListProps) {
    const [selectedTag, setSelectedTag] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    const ITEMS_PER_PAGE = 8

    // タグが変更されたら、または親からのshopsが変更されたらページを1に戻す
    useEffect(() => {
        setCurrentPage(1)
    }, [selectedTag, shops])

    // 一覧に存在するすべてのタグを抽出
    const allTags = Array.from(
        new Set(
            shops.flatMap((shop) => shop.tags ?? [])
        )
    )

    // 選択されたタグに応じて表示するお店を絞り込む
    const filteredShops = shops.filter((shop) => {
        if (!selectedTag) return true
        return shop.tags?.includes(selectedTag)
    })

    const totalPages = Math.ceil(filteredShops.length / ITEMS_PER_PAGE)

    const paginatedShops = filteredShops.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    return (
        <div className="space-y-5">
            {/* User Provided Header (e.g. Tabs) & Tag UI */}
            <div className="space-y-3">
                {children}

                {/* タグ絞り込みUI */}
                {allTags.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        <button
                            onClick={() => setSelectedTag(null)}
                            className={`shrink-0 rounded-full px-3 py-1 text-sm transition ${selectedTag === null
                                ? 'bg-accent text-accent-foreground font-medium'
                                : 'bg-muted hover:bg-muted/80'
                                }`}
                        >
                            すべて
                        </button>

                        {allTags.map((t) => (
                            <button
                                key={t}
                                onClick={() => setSelectedTag(t)}
                                className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-sm transition ${selectedTag === t
                                    ? 'bg-accent text-accent-foreground font-medium'
                                    : 'bg-muted hover:bg-muted/80'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* お店カード一覧 */}
            {paginatedShops.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {paginatedShops.map((shop) => (
                        <RestaurantCard key={shop.id} restaurant={shop} />
                    ))}
                </div>
            ) : (
                <div className="py-12 text-center text-gray-500">
                    該当するお店が見つかりません
                </div>
            )}

            {/* ページネーション (2ページ以上ある場合のみ表示) */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition ${currentPage === i + 1
                                ? 'bg-accent text-accent-foreground font-medium'
                                : 'bg-muted hover:bg-muted/80'
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
