'use client'

import dynamic from 'next/dynamic'
import { useCallback, useState } from 'react'
import type { MapPlace } from './map-place'

// Leaflet 은 불러오는 순간 window 를 읽어서 빌드 때 굽지 않고 브라우저에서만 싣는다
const CampusMap = dynamic(() => import('./CampusMap'), { ssr: false })

// 장소를 고르면 올라올 시트 1단계 높이(피그마 197). 고른 마커를 이만큼 위로 비켜 둔다
const SHEET_PEEK_HEIGHT = 197

/** 머리 아래 남은 화면을 지도로 채운다. 도크는 지도 위에 떠 있고, 고른 장소는 여기서 들고 있다 */
export function MapView({ places }: { places: MapPlace[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [focusRequest, setFocusRequest] = useState(0)
  const select = useCallback((id: number) => {
    setSelectedId(id)
    setFocusRequest((n) => n + 1)
  }, [])
  const clearSelection = useCallback(() => setSelectedId(null), [])

  return (
    // 배경은 이미지 가장자리 색(경계 숨김), 도크 여백은 되돌려 바닥까지 채우고, isolate 로 Leaflet z-index(400~1000)를 가둬 도크를 위에 둔다
    <div className="isolate bg-[#fefaf2] -mb-(--dock-space) h-[calc(100dvh-env(safe-area-inset-top)-var(--spacing)*19)]">
      <CampusMap
        places={places}
        selectedId={selectedId}
        onSelect={select}
        onClear={clearSelection}
        focusRequest={focusRequest}
        bottomInset={SHEET_PEEK_HEIGHT}
      />
    </div>
  )
}
