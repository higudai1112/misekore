'use client'

import Image from 'next/image'
import Link from 'next/link'

// お店一覧に表示するカードコンポーネントに渡すデータの型定義
export type Restaurant = {
  id: string
  name: string
  walk: string
  tags: string[]
  imageURL?: string
  status: 'want' | 'visited' | 'favorite'
}

// 個別のお店の情報をカード形式で表示するコンポーネント
export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  // そのお店のステータスが「行った（visited）」かどうかを判定
  const isVisited = restaurant.status === 'visited'

  return (
    <Link href={`/shops/${restaurant.id}`}>
      <article
        className={`overflow-hidden rounded-2xl bg-white ring-1 ${isVisited ? 'ring-[#c8d6c8]' : 'ring-black/5'
          }`}
      >
        {/* カード上部の画像表示エリア */}
        <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[3/2] lg:aspect-[16/10]">
          {restaurant.imageURL ? (
            <Image
              src={restaurant.imageURL}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
          ) : (
            // 画像が無い場合はプレースホルダー領域を表示
            <div className="flex h-full items-center justify-center bg-[#e6efe6] text-xs text-[#4f6f4f]">
              No Image
            </div>
          )}
        </div>
        <div className="space-y-2 p-3 sm:space-y-3 sm:p-4">
          {/* お店の名前 */}
          <h3 className="font-serif text-sm font-medium text-gray-800 sm:text-base">
            {restaurant.name}
          </h3>

          {/* 住所（walkというプロパティ名だが、現状は住所が渡されている） */}

          <p className="rounded-full bg-[#e6efe6] px-2 py-1 text-[10px] text-[#4f6f4f] sm:text-[11px]">
            {restaurant.walk}
          </p>

          {/* お店に設定されているタグをループして表示 */}
          <div className="flex flex-wrap gap-2">
            {restaurant.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#e6efe6] px-2 py-1 text-[#4f6f4f]"
              >
                {tag}
              </span>
            ))}
          </div>
          {/* カード右下のアイコン表示（ステータスに応じて変更） */}
          <div className="flex justify-end pt-1 text-sm sm:pt-2 sm:text-base">
            {isVisited ? (
              <span className="text-[#8fae8f]">⭐️</span> // 行ったお店（visited）の場合は星アイコン
            ) : (
              <span className="text-[#8fae8f]">✏️</span> // それ以外（want/favorite）の場合はメモ（鉛筆）アイコン
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
