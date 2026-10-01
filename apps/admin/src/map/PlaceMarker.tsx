import { divIcon, type LeafletEvent, type Marker as LeafletMarker } from 'leaflet'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Marker, useMap } from 'react-leaflet'
import type { CategoryCode } from '../mocks/types'
import { toLatLng, type Point } from './campus'
import { CATEGORY_COLORS } from './category-colors'
import styles from './CampusMap.module.css'
import braceletIcon from './icons/bracelet.svg'
import foodtruckIcon from './icons/foodtruck.svg'
import mediIcon from './icons/medi.svg'
import { placeLabel } from './place-label'

/** 이 배율부터 점이 글자·아이콘 든 마커로 커진다. user 앱과 같은 값 */
export const FULL_MARKER_ZOOM = -1

// 선택된 마커를 이웃 위로 올린다
const SELECTED_Z_OFFSET = 1000

// 구역 번호 대신 아이콘을 보여 주는 카테고리. user 앱과 같은 그림이다
const PLACE_ICONS: Partial<Record<CategoryCode, string>> = {
  FOODTRUCK: foodtruckIcon,
  MEDI: mediIcon,
  BRACELET: braceletIcon,
}

// Leaflet 이 문자열로 받아 그리므로 HTML 로 만든다. 모양은 user 앱 PlaceMarkers 의 markerHtml 과 같다
function markerHtml(code: CategoryCode, label: string | null) {
  const icon = PLACE_ICONS[code]
  const content = icon ? `<img src="${icon}" alt="" draggable="false" />` : (label ?? '')
  return `<span class="${styles.marker}" style="--place-color:${CATEGORY_COLORS[code]}">
  <span class="${styles.ring}"></span>
  <span class="${styles.circle}"><span class="${styles.content}">${content}</span></span>
</span>`
}

/** 배율에 따라 지도 칸에 data-markers 를 달아 마커가 CSS 만으로 점·전체 모양을 오가게 한다 */
export function MarkerZoomLevel() {
  const map = useMap()

  useEffect(() => {
    const update = () => {
      map.getContainer().dataset.markers = map.getZoom() >= FULL_MARKER_ZOOM ? 'full' : 'dot'
    }
    update()
    map.on('zoom', update)
    return () => {
      map.off('zoom', update)
    }
  }, [map])

  return null
}

/** 장소 마커 하나. user 지도와 같은 색·글자·아이콘이고, 선택되면 바깥에 고유 색 링이 퍼진다 */
export function PlaceMarker({
  point,
  code,
  sequence,
  selected = false,
  onSelect,
  children,
}: {
  point: Point
  code: CategoryCode
  sequence: number
  selected?: boolean
  onSelect?: () => void
  /** 툴팁처럼 마커에 붙일 것 */
  children?: ReactNode
}) {
  const markerRef = useRef<LeafletMarker>(null)
  const selectedRef = useRef(selected)
  const label = placeLabel(code, sequence)

  // 아이콘을 다시 만들면 Leaflet 이 안을 갈아 끼워 링 전환이 끊기므로 모양 값이 바뀔 때만 만든다
  const icon = useMemo(
    () => divIcon({ html: markerHtml(code, label), className: styles.root, iconSize: [0, 0] }),
    [code, label],
  )
  const position = useMemo(() => toLatLng(point), [point])

  // 선택 표시는 Leaflet 뿌리 요소의 속성이라, 레이어가 다시 붙어 요소가 새로 생기면 add 때도 단다
  const sync = (marker: LeafletMarker | null) => {
    marker?.getElement()?.toggleAttribute('data-selected', selectedRef.current)
    marker?.setZIndexOffset(selectedRef.current ? SELECTED_Z_OFFSET : 0)
  }

  useEffect(() => {
    selectedRef.current = selected
    sync(markerRef.current)
  }, [selected])

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={icon}
      interactive={Boolean(onSelect)}
      eventHandlers={{
        // 마커 클릭이 지도까지 올라가면 마커를 눌러 연 시트가 배경 클릭으로 바로 닫힌다
        click: (event) => {
          event.originalEvent.stopPropagation()
          onSelect?.()
        },
        add: ({ target }: LeafletEvent) => sync(target as LeafletMarker),
      }}
    >
      {children}
    </Marker>
  )
}
