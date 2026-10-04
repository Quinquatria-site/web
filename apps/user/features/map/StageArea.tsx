'use client'

import type { LeafletEvent, Polygon as LeafletPolygon } from 'leaflet'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { Polygon } from 'react-leaflet'
import { getMessages } from '@/shared/i18n/messages'
import { localePath } from '@/shared/i18n/paths'
import { useLocale } from '@/shared/i18n/useLocale'
import { type MapPoint, toLatLng } from './map-coords'

// 운동장 무대 꼭짓점. 가운데 이름표(map-labels 의 stage)와 같은 자리다
const STAGE_AREA: MapPoint[] = [
  { x: 880, y: 325 },
  { x: 949, y: 300 },
  { x: 924, y: 231 },
  { x: 855, y: 256 },
]

const STAGE_POSITIONS = STAGE_AREA.map(toLatLng)

/** 운동장 무대 영역. 장소가 아니라 시트를 열지 않고, 누르면 공연 페이지로 간다 */
export function StageArea() {
  const locale = useLocale()
  const router = useRouter()
  const name = getMessages(locale).map.labels.stage
  const eventHandlers = useMemo(() => {
    const open = () => router.push(localePath(locale, '/schedule'))
    return {
      click: open,
      add: ({ target }: LeafletEvent) => {
        // Leaflet 이 그린 path 는 포커스·이름이 없어 링크처럼 직접 단다
        const element = (target as LeafletPolygon).getElement()
        element?.setAttribute('role', 'link')
        element?.setAttribute('tabindex', '0')
        element?.setAttribute('aria-label', name)
        element?.addEventListener('keydown', (event) => {
          if (!(event instanceof KeyboardEvent) || event.key !== 'Enter') return
          event.preventDefault()
          open()
        })
      },
    }
  }, [locale, name, router])

  return (
    // 누름이 지도로 번지면 빈 곳 탭으로 읽혀 열린 시트가 닫힌다. 색은 Leaflet 속성보다 앞서는 클래스로 칠한다
    <Polygon
      positions={STAGE_POSITIONS}
      weight={2}
      lineJoin="round"
      fillOpacity={0.3}
      bubblingMouseEvents={false}
      className="fill-performance-artist stroke-performance-artist"
      eventHandlers={eventHandlers}
    />
  )
}
