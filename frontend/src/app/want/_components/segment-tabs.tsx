'use client'

import { useState } from 'react'

type Tab = 'want' | 'visited' | 'all'

export function SegmentTabs() {
  const [tab, setTab] = useState<Tab>('want')

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
            onClick={() => setTab(t.key as Tab)}
            className={`rounded-full py-2 transition sm:py-2.5 ${
              tab === t.key ? 'bg-[#8fae8f] text-white' : 'text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
