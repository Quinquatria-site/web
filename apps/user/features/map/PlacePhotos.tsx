'use client'

import { useState } from 'react'
import { ZoomablePhoto } from '@/shared/photo/ZoomablePhoto'

/** 사진 줄 높이. 1단계 높이가 이 값에 기대 있다 */
export const PLACE_PHOTO_HEIGHT = 190

// 비율을 읽기 전의 틀. 대부분 인스타 피드(4:5)로 올라온다
const FALLBACK_ASPECT = 4 / 5

// 높이는 고정하고 너비를 원본 비율대로 둬서, 세로·가로 사진 모두 잘리지 않는다
function PlacePhoto({ images, index, alt }: { images: string[]; index: number; alt: string }) {
  const [aspect, setAspect] = useState(FALLBACK_ASPECT)
  return (
    <li style={{ aspectRatio: aspect }} className="h-full shrink-0 overflow-hidden rounded-lg">
      <ZoomablePhoto
        src={images[index]}
        alt={alt}
        // 뷰어에서도 옆으로 넘겨 이 장소의 다른 사진을 본다
        gallery={{ photos: images, index }}
        sizes="(max-width: 480px) 90vw, 432px"
        onLoad={({ currentTarget: { naturalWidth, naturalHeight } }) => {
          if (naturalWidth && naturalHeight) setAspect(naturalWidth / naturalHeight)
        }}
      />
    </li>
  )
}

/** 장소 사진 줄. 같은 높이로 이어 붙여 옆으로 밀어 보고, 누르면 크게 본 채 옆 사진으로 넘긴다. 없으면 그리지 않는다 */
export function PlacePhotos({ images, alt }: { images: string[]; alt: string }) {
  // 포스터를 안 올린 부스가 많아, 빈 문양 칸 대신 설명이 바로 올라오게 한다
  if (!images.length) return null

  return (
    // 포커스를 받으면 방향키로 옆으로 민다. 시트 좌우 여백까지 사진이 흘러가게 여백만큼 바깥으로 늘린다
    <ul
      tabIndex={0}
      aria-label={alt}
      style={{ height: PLACE_PHOTO_HEIGHT }}
      className="-mx-7 flex gap-2 overflow-x-auto overscroll-x-contain px-7 [scrollbar-width:none]"
    >
      {images.map((src, i) => (
        <PlacePhoto key={src} images={images} index={i} alt={alt} />
      ))}
    </ul>
  )
}
