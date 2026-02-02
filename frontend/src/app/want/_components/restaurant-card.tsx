'use client'

import Image from 'next/image'

export type Restaurant = {
  id: string
  name: string
  walk: string
  tags: string[]
  imageURL: string
  status: 'want' | 'visited'
}

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const isVisited = restaurant.status === 'visited'

  return (
    <article
      className={`overflow-hidden rounded-2xl bg-white ring-1 ${
        isVisited ? 'ring-[#c8d6c8]' : 'ring-black/5'
      }`}
    >
      {/* 画像 */}
      <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[3/2] lg:aspect-[16/10]">
        <Image
          src={restaurant.imageURL}
          alt={restaurant.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="space-y-2 p-3 sm:space-y-3 sm:p-4">
        {/* 店名 */}
        <h3 className="font-serif text-sm font-medium text-gray-800 sm:text-base">
          {restaurant.name}
        </h3>

        <p className="rounded-full bg-[#e6efe6] px-2 py-1 text-[10px] text-[#4f6f4f] sm:text-[11px]">
          {restaurant.walk}
        </p>

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
        {/* アイコン */}
        <div className="flex justify-end pt-1 text-sm sm:pt-2 sm:text-base">
          {isVisited ? (
            <span className="text-[#8fae8f]">⭐️</span> // 自分の評価
          ) : (
            <span className="text-[#8fae8f]">✏️</span> //メモ済み
          )}
        </div>
      </div>
    </article>
  )
}
