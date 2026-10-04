'use client'

import type { LeafletEvent, PathOptions, Polygon as LeafletPolygon } from 'leaflet'
import { memo, useEffect, useMemo, useRef } from 'react'
import { Polygon } from 'react-leaflet'
import { type MapPoint, toLatLng } from './map-coords'
import type { MapPlace, PlaceId } from './map-place'
import { PLACE_FILL, PLACE_STROKE } from './place-colors'

// 채움 30% 에 같은 색 점선 2. 점선은 6 긋고 4 쉰다. 누름이 지도로 번지면 빈 곳 탭으로 읽혀 시트가 바로 닫힌다
const AREA_OPTIONS: PathOptions = {
  weight: 2,
  dashArray: '6 4',
  lineJoin: 'round',
  fillOpacity: 0.3,
  bubblingMouseEvents: false,
}

// Leaflet 이 그린 path 는 포커스·이름이 없어 마커처럼 직접 단다. 레이어가 다시 붙으면 요소가 새로 생겨 add 때도 부른다
function syncArea(layer: LeafletPolygon, selected: boolean, name: string) {
  const element = layer.getElement()
  element?.setAttribute('role', 'button')
  element?.setAttribute('tabindex', '0')
  element?.setAttribute('aria-pressed', String(selected))
  element?.setAttribute('aria-label', name)
}

/** 점 대신 영역으로 표시하는 장소. 누르면 마커처럼 장소를 고른다 */
export const PlaceArea = memo(function PlaceArea({
  place,
  name,
  area,
  selected,
  onSelect,
}: {
  place: MapPlace
  name: string
  area: MapPoint[]
  selected: boolean
  onSelect: (id: PlaceId) => void
}) {
  const { id, code } = place
  const layerRef = useRef<LeafletPolygon>(null)
  // add 핸들러가 다시 만들어지지 않게 최신 선택은 ref 로 읽는다
  const selectedRef = useRef(selected)
  const positions = useMemo(() => area.map(toLatLng), [area])
  const eventHandlers = useMemo(
    () => ({
      click: () => onSelect(id),
      add: ({ target }: LeafletEvent) => {
        const layer = target as LeafletPolygon
        syncArea(layer, selectedRef.current, name)
        // path 는 Leaflet 키보드 처리 밖이라 Enter·Space 를 직접 받는다
        layer.getElement()?.addEventListener('keydown', (event) => {
          if (!(event instanceof KeyboardEvent)) return
          if (event.key !== 'Enter' && event.key !== ' ') return
          event.preventDefault()
          onSelect(id)
        })
      },
    }),
    [id, name, onSelect],
  )

  useEffect(() => {
    selectedRef.current = selected
    if (layerRef.current) syncArea(layerRef.current, selected, name)
  }, [selected, name])

  return (
    // 만들 때만 읽는 옵션이라 pathOptions 가 아닌 prop 으로 준다. 색은 Leaflet 이 속성으로 넣어 토큰을 못 쓰니 속성보다 앞서는 클래스로 칠한다
    <Polygon
      ref={layerRef}
      positions={positions}
      {...AREA_OPTIONS}
      className={`${PLACE_FILL[code]} ${PLACE_STROKE[code]}`}
      eventHandlers={eventHandlers}
    />
  )
})
