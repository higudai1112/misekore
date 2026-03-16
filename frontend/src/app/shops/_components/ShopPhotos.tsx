'use client'

import { Swiper, SwiperSlide } from 'swiper/react'

// お店の詳細画面で複数の写真をスワイプ可能なカルーセル形式で表示するコンポーネント
export function ShopPhotos({
  photos,
}: {
  photos: { id: string; url: string }[]
}) {
  // 写真が1枚もない場合はプレースホルダー領域を表示
  if (photos.length === 0) {
    return (
      <div className="h-56 bg-muted flex items-center justify-center">
        No Image
      </div>
    )
  }

  return (
    <Swiper className="h-56">
      {photos.map((p) => (
        <SwiperSlide key={p.id}>
          <img
            src={p.url}
            alt=""
            className="h-full w-full object-cover"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}