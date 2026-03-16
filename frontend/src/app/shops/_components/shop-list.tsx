'use client'

import { useState } from 'react'
import { SegmentTabs } from './segment-tabs'
import type { Restaurant } from './restaurant-card'
import { TagFilteredShopList } from './tag-filtered-shop-list'

type ShopListProps = {
    shops: Restaurant[]
}

export function ShopList({ shops }: ShopListProps) {
    const [tab, setTab] = useState<'want' | 'visited' | 'all'>('want')

    // 選択されたタブに応じて表示するお店を絞り込む
    const tabFilteredShops = shops.filter((shop) => {
        if (tab === 'all') return true
        if (tab === 'want') return shop.status === 'want'
        if (tab === 'visited') return shop.status === 'visited'
        return false
    })

    return (
        <TagFilteredShopList shops={tabFilteredShops}>
            <SegmentTabs activeTab={tab} onTabChange={setTab} />
        </TagFilteredShopList>
    )
}

