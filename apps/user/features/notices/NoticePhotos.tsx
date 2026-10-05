'use client'

import { useState } from 'react'
import { ZoomablePhoto } from '@/shared/photo/ZoomablePhoto'

// 여러 장이면 몇 번째인지 붙여 읽는 사람이 사진을 구분한다
const photoName = (alt: string, images: string[], i: number) =>
  images.length > 1 ? `${alt} ${i + 1}` : alt

// 비율을 읽기 전의 틀. 카드뉴스는 대부분 인스타 피드(4:5)로 올라온다
const FALLBACK_ASPECT = 4 / 5

// 폭은 본문에 맞추고 높이를 원본 비율대로 둬서 카드뉴스가 잘리지 않는다
function NoticePhoto({ src, alt }: { src: string; alt: string }) {
  const [aspect, setAspect] = useState(FALLBACK_ASPECT)
  return (
    <li style={{ aspectRatio: aspect }} className="w-full overflow-hidden rounded-lg">
      <ZoomablePhoto
        src={src}
        alt={alt}
        sizes="(max-width: 480px) 90vw, 430px"
        onLoad={({ currentTarget: { naturalWidth, naturalHeight } }) => {
          if (naturalWidth && naturalHeight) setAspect(naturalWidth / naturalHeight)
        }}
      />
    </li>
  )
}

/** 공지 사진. 올린 순서대로 본문 폭에 세로로 쌓고, 누르면 크게 본다 */
export function NoticePhotos({ images, alt }: { images: string[]; alt: string }) {
  return (
    <ul aria-label={alt} className="flex flex-col gap-3 px-[5px] pt-6">
      {images.map((src, i) => (
        <NoticePhoto key={src} src={src} alt={photoName(alt, images, i)} />
      ))}
    </ul>
  )
}
