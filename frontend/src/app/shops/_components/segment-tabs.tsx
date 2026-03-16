'use client'

import { useState } from 'react'

export type Tab = 'want' | 'visited' | 'all'

type SegmentTabsProps = {
  activeTab: Tab // 親コンポーネント（ShopList）から渡される現在の選択タブ
  onTabChange: (tab: Tab) => void // タブがクリックされた時に親に通知する関数
}

// タブを切り替えるためのUIコンポーネント
export function SegmentTabs({ activeTab, onTabChange }: SegmentTabsProps) {

  return (
    <div className="rounded-full bg-[#e6efe6] p-1 sm:p-1.5">
      <div className="grid grid-cols-3 text-xs sm:text-sm">
        {[
          { key: 'want', label: '行きたい' },
          { key: 'visited', label: '行った' },
          { key: 'all', label: 'すべて' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key as Tab)}
            className={`rounded-full py-2 transition sm:py-2.5 ${activeTab === t.key ? 'bg-[#8fae8f] text-white' : 'text-gray-700'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
