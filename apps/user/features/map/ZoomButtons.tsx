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

/** 지도 오른쪽 아래 확대·축소 버튼. 도크 바로 위에 뜨고, 끝 배율에 닿으면 그쪽 버튼을 끈다 */
export function ZoomButtons() {
  const map = useMap()
  const { zoomIn, zoomOut } = getMessages(useLocale()).map
  const ref = useRef<HTMLDivElement>(null)
  const [limits, setLimits] = useState(() => readLimits(map))

  useEffect(() => {
    const element = ref.current
    // 버튼 누름이 지도로 번지면 빈 곳 클릭으로 읽혀 선택이 풀리고, 두 번 누르면 지도가 확대된다
    if (element) DomEvent.disableClickPropagation(element)
    // 화면 크기가 바뀌면 배율은 그대로인데 최소 배율만 바뀌어서 zoomlevelschange 도 듣는다
    const update = () => setLimits(readLimits(map))
    map.on('zoomend zoomlevelschange', update)
    return () => {
      map.off('zoomend zoomlevelschange', update)
    }
  }, [map])

  const buttonClass =
    'grid h-10 w-full place-items-center text-[32px] leading-none text-accent disabled:opacity-40'

  return (
    <div
      ref={ref}
      // Leaflet 판(400~1000) 위에 둔다
      className="absolute right-[27px] bottom-[calc(var(--dock-space)-4px)] z-[1000] flex w-[43px] flex-col divide-y divide-map-control-border overflow-hidden rounded-xl border border-map-control-border bg-bg shadow-[0_1px_4px_var(--color-map-control-border)]"
    >
      <button
        type="button"
        aria-label={zoomIn}
        disabled={!limits.canZoomIn}
        onClick={() => map.zoomIn()}
        className={buttonClass}
      >
        +
      </button>
      <button
        type="button"
        aria-label={zoomOut}
        disabled={!limits.canZoomOut}
        onClick={() => map.zoomOut()}
        className={buttonClass}
      >
        -
      </button>
    </div>
  )
}
