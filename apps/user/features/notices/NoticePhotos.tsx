'use client'

import { useState } from 'react'
import { ZoomablePhoto } from '@/shared/photo/ZoomablePhoto'

// 비율을 읽기 전의 틀. 카드뉴스는 대부분 인스타 피드(4:5)로 올라온다
const FALLBACK_ASPECT = 4 / 5

// 폭은 본문에 맞추고 높이를 원본 비율대로 둬서 카드뉴스가 잘리지 않는다
function NoticePhoto({
  src,
  alt,
  gallery,
}: {
  src: string
  alt: string
  gallery: { photos: string[]; index: number }
}) {
  const [aspect, setAspect] = useState(FALLBACK_ASPECT)
  return (
    <li style={{ aspectRatio: aspect }} className="w-full overflow-hidden rounded-lg">
      <ZoomablePhoto
        src={src}
        alt={alt}
        sizes="(max-width: 480px) 90vw, 430px"
        gallery={gallery}
        onLoad={({ currentTarget: { naturalWidth, naturalHeight } }) => {
          if (naturalWidth && naturalHeight) setAspect(naturalWidth / naturalHeight)
        }}
      />
    </li>
  )
}

/** 공지 사진. 올린 순서대로 본문 폭에 세로로 쌓고, 누르면 크게 보며 옆 사진으로 넘긴다 */
export function NoticePhotos({ images, alt }: { images: string[]; alt: string }) {
  return (
    <ul aria-label={alt} className="flex flex-col gap-3 px-[5px] pt-6">
      {images.map((src, i) => (
        <NoticePhoto key={src} src={src} alt={alt} gallery={{ photos: images, index: i }} />
      ))}
    </ul>
  )
}
