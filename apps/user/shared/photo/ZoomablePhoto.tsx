'use client'

import { useRef, useState } from 'react'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { Photo } from './Photo'
import { PhotoViewer } from './PhotoViewer'

// 누른 뒤 이만큼(px) 넘게 움직였으면 넘기기·스크롤로 보고 뷰어를 열지 않는다
const TAP_SLOP = 10

/** 누르면 화면 가득 띄워 확대해 볼 수 있는 Photo. 사진이 없으면 그냥 빈 사진 자리다 */
export function ZoomablePhoto({
  src,
  alt,
  sizes,
}: {
  src: string | null
  alt: string
  sizes: string
}) {
  const { photoViewer } = getMessages(useLocale())
  const [open, setOpen] = useState(false)
  const down = useRef<{ x: number; y: number } | null>(null)

  if (!src) return <Photo src={null} alt={alt} sizes={sizes} />

  return (
    <PhotoViewer open={open} onOpenChange={setOpen} src={src} alt={alt} sizes={sizes}>
      <button
        type="button"
        aria-label={photoViewer.open.replace('{name}', alt)}
        onPointerDown={(event) => {
          down.current = { x: event.clientX, y: event.clientY }
        }}
        onClick={(event) => {
          const start = down.current
          down.current = null
          // 마우스로 카드를 밀어 넘긴 뒤에도 click 이 오므로 움직인 거리로 거른다. 키보드로 누르면 start 가 없다
          if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > TAP_SLOP)
            event.preventDefault()
        }}
        className="block size-full cursor-zoom-in"
      >
        <Photo src={src} alt={alt} sizes={sizes} />
      </button>
    </PhotoViewer>
  )
}
