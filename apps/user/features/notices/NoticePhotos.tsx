'use client'

import { useState } from 'react'
import { ZoomablePhoto } from '@/shared/photo/ZoomablePhoto'

// 여러 장이면 몇 번째인지 붙여 읽는 사람이 사진을 구분한다
const photoName = (alt: string, images: string[], i: number) =>
  images.length > 1 ? `${alt} ${i + 1}` : alt

/** 공지 사진 캐러셀. 화면 폭을 채운 3:4 틀을 옆으로 넘기고, 비율이 다른 사진은 자르지 않고 여백을 두며, 누르면 크게 본다 */
export function NoticePhotos({ images, alt }: { images: string[]; alt: string }) {
  const [current, setCurrent] = useState(0)
  return (
    <div className="flex flex-col items-center gap-3">
      {/* 총학 인스타 카드뉴스가 3:4 라 틀을 그 비율로 고정한다. 포커스를 받으면 방향키로 넘긴다 */}
      <ul
        tabIndex={0}
        aria-label={alt}
        onScroll={({ currentTarget: { scrollLeft, clientWidth } }) =>
          setCurrent(Math.round(scrollLeft / (clientWidth || 1)))
        }
        className="flex w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none]"
      >
        {images.map((src, i) => (
          <li key={src} className="aspect-[3/4] w-full shrink-0 snap-center snap-always">
            <ZoomablePhoto
              src={src}
              alt={photoName(alt, images, i)}
              sizes="(max-width: 480px) 100vw, 480px"
              contain
            />
          </li>
        ))}
      </ul>
      {images.length > 1 && (
        <div aria-hidden className="flex gap-1.5">
          {images.map((src, i) => (
            <span
              key={src}
              className={`size-1.5 rounded-full bg-secondary ${i === current ? '' : 'opacity-25'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
