'use client'

import { DomEvent, type Map as LeafletMap } from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import { useMap } from 'react-leaflet'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'

// 끝 배율에 닿았는지. 둘 다 새 객체라 값이 같아도 다시 그려 최소 배율 변화를 놓치지 않는다
function readLimits(map: LeafletMap) {
  return {
    canZoomIn: map.getZoom() < map.getMaxZoom(),
    canZoomOut: map.getZoom() > map.getMinZoom(),
  }
}

const controlClass =
  'overflow-hidden border border-map-control-border bg-map-control/80 text-on-map-control shadow-[0_1px_4px_var(--color-map-control-glow)]'

/** 지도 아래 양 끝 버튼. 왼쪽은 장소 목록, 오른쪽은 확대·축소. 도크 바로 위에 뜨고, 끝 배율에 닿으면 그쪽 버튼을 끈다 */
export function MapControls({ onOpenList }: { onOpenList: () => void }) {
  const map = useMap()
  const { zoomIn, zoomOut, openList } = getMessages(useLocale()).map
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLButtonElement>(null)
  const [limits, setLimits] = useState(() => readLimits(map))

  useEffect(() => {
    // 버튼 누름이 지도로 번지면 빈 곳 클릭으로 읽혀 선택이 풀리고, 두 번 누르면 지도가 확대된다
    for (const element of [ref.current, listRef.current]) {
      if (element) DomEvent.disableClickPropagation(element)
    }
    // 화면 크기가 바뀌면 배율은 그대로인데 최소 배율만 바뀌어서 zoomlevelschange 도 듣는다
    const update = () => setLimits(readLimits(map))
    map.on('zoomend zoomlevelschange', update)
    return () => {
      map.off('zoomend zoomlevelschange', update)
    }
  }, [map])

  const zoomClass =
    'grid h-10 w-full place-items-center text-[32px] leading-none disabled:opacity-40'

  return (
    <>
      <button
        ref={listRef}
        type="button"
        aria-label={openList}
        onClick={onOpenList}
        // 높이는 확대·축소 묶음 아랫변에, 왼쪽은 검색창·칩 선(17)에 맞춘다. 걷어 낼 때는 왼쪽 밖으로 빠진다
        className={`absolute bottom-[calc(var(--dock-space)-4px)] left-[17px] z-[1000] grid size-[43px] place-items-center rounded-full transition-[translate,opacity,visibility] duration-300 ease-out in-data-[chrome=hidden]:invisible in-data-[chrome=hidden]:-translate-x-[calc(100%+17px)] in-data-[chrome=hidden]:opacity-0 ${controlClass}`}
      >
        <ListIcon className="size-[22px]" />
      </button>
      <div
        ref={ref}
        // Leaflet 판(400~1000) 위에 두고, 걷어 낼 때는 오른쪽 밖으로 빠진다
        className="absolute right-[27px] bottom-[calc(var(--dock-space)-4px)] z-[1000] w-[43px] transition-[translate,opacity,visibility] duration-300 ease-out in-data-[chrome=hidden]:invisible in-data-[chrome=hidden]:translate-x-[calc(100%+27px)] in-data-[chrome=hidden]:opacity-0"
      >
        <div
          className={`flex flex-col divide-y divide-map-control-border rounded-xl ${controlClass}`}
        >
          <button
            type="button"
            aria-label={zoomIn}
            disabled={!limits.canZoomIn}
            onClick={() => map.zoomIn()}
            className={zoomClass}
          >
            +
          </button>
          <button
            type="button"
            aria-label={zoomOut}
            disabled={!limits.canZoomOut}
            onClick={() => map.zoomOut()}
            className={zoomClass}
          >
            -
          </button>
        </div>
      </div>
    </>
  )
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      className={className}
    >
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="0.6" fill="currentColor" />
      <circle cx="4.5" cy="12" r="0.6" fill="currentColor" />
      <circle cx="4.5" cy="18" r="0.6" fill="currentColor" />
    </svg>
  )
}
