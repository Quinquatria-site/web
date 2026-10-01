'use client'

import { useState } from 'react'
import { Photo } from '@/shared/photo/Photo'

/** 장소 사진. 여러 장이면 옆으로 넘기고 오른쪽 아래에 몇 번째인지 적는다. 없으면 빈 사진 자리 하나 */
export function PlacePhotos({ images, alt }: { images: string[] | null; alt: string }) {
  const [index, setIndex] = useState(0)
  const photos = images?.length ? images : [null]

  return (
    <div className="relative h-[178px] overflow-hidden rounded-lg">
      {/* 포커스를 받으면 방향키로 옆 사진으로 넘어간다 */}
      <ul
        tabIndex={0}
        aria-label={alt}
        onScroll={(event) => {
          const { scrollLeft, clientWidth } = event.currentTarget
          setIndex(Math.round(scrollLeft / clientWidth))
        }}
        className="flex size-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none]"
      >
        {photos.map((src, i) => (
          <li key={src ?? i} className="size-full shrink-0 snap-center">
            <Photo
              src={src}
              alt={photos.length > 1 ? `${alt} ${i + 1}` : alt}
              sizes="(max-width: 480px) 90vw, 432px"
            />
          </li>
        ))}
      </ul>
      {photos.length > 1 && (
        <span
          aria-live="polite"
          className="absolute right-2 bottom-2 rounded-full bg-secondary/60 px-2 py-0.5 text-xs text-on-secondary"
        >
          {index + 1} / {photos.length}
        </span>
      )}
    </div>
  )
}
