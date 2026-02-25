'use client'

import { Swiper, SwiperSlide } from 'swiper/react'

export function ShopPhotos({
  photos,
}: {
  photos: { id: string; url: string }[]
}) {
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