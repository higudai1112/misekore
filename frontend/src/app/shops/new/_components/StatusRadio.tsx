'use client'

import type { ShopStatus } from '@/types/shop'

// 選択肢の定義
const OPTIONS: { value: ShopStatus; label: string }[] = [
  { value: 'WANT', label: '行きたい' },
  { value: 'VISITED', label: '行った' },
  { value: 'FAVORITE', label: 'お気に入り' },
]

// 登録フォーム用ステータス選択ラジオボタン（デフォルト: WANT）
export function StatusRadio() {
  return (
    <div className="flex gap-2">
      {OPTIONS.map(({ value, label }) => (
        <label key={value} className="flex-1 cursor-pointer">
          <input
            type="radio"
            name="status"
            value={value}
            defaultChecked={value === 'WANT'}
            className="peer sr-only"
          />
          <span className="block rounded-full border border-gray-300 py-2 text-center text-sm font-medium text-gray-500 transition peer-checked:border-[#8fae8f] peer-checked:bg-[#8fae8f] peer-checked:text-white">
            {label}
          </span>
        </label>
      ))}
    </div>
  )
}
