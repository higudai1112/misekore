'use client'

import { useState } from 'react'
import { SegmentTabs } from './segment-tabs'
import { RestaurantCard, type Restaurant } from './restaurant-card'

type ShopListProps = {
    shops: Restaurant[]
}

export function ShopList({ shops }: ShopListProps) {
    // 現在選択されているタブの状態を管理（初期値は 'want' = 行きたい）
    const [tab, setTab] = useState<'want' | 'visited' | 'all'>('want')

    // 選択されたタブに応じて表示するお店を絞り込む
    const filteredShops = shops.filter((shop) => {
        // 「すべて」タブの場合は全てのお店を表示
        if (tab === 'all') return true

        // 「行きたい」タブの場合は status が 'want' のお店だけ表示
        if (tab === 'want') return shop.status === 'want'

        // 「行った」タブの場合は status が 'visited' のお店だけ表示
        if (tab === 'visited') return shop.status === 'visited'

        return false
    })

    return (
        <div className="space-y-5">
            {/* タブ欄 */}
            <SegmentTabs activeTab={tab} onTabChange={setTab} />

            {/* お店カード一覧 */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filteredShops.map((shop) => (
                    <RestaurantCard key={shop.id} restaurant={shop} />
                ))}
            </div>
        </div>
    )
}
