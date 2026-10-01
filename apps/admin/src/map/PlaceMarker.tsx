import {
  divIcon,
  type LeafletEvent,
  type LeafletKeyboardEvent,
  type Marker as LeafletMarker,
} from 'leaflet'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Marker, useMap } from 'react-leaflet'
import { toLatLng, type Point } from './campus'
import { CATEGORY_COLORS } from './category-colors'
import styles from './CampusMap.module.css'
import braceletIcon from './icons/bracelet.svg'
import foodtruckIcon from './icons/foodtruck.svg'
import mediIcon from './icons/medi.svg'
import photoIcon from './icons/photo.svg'
import trashIcon from './icons/trash.svg'
import { placeLabel, type PlaceCode } from './place-label'

/** 이 배율부터 점이 글자·아이콘 든 마커로 커진다. user 앱과 같은 값 */
export const FULL_MARKER_ZOOM = -1

// 선택된 마커를 이웃 위로 올린다
const SELECTED_Z_OFFSET = 1000

// 구역 번호 대신 아이콘을 보여 주는 카테고리. user 앱과 같은 그림이다
const PLACE_ICONS: Partial<Record<PlaceCode, string>> = {
  FOODTRUCK: foodtruckIcon,
  MEDI: mediIcon,
  BRACELET: braceletIcon,
  PHOTO: photoIcon,
  TRASH: trashIcon,
}

// 마커 이름. user messages/ko.ts 의 map.places 와 같다. 스크린리더가 "부스 A1" 처럼 읽는다
const PLACE_NAMES: Record<PlaceCode, string> = {
  BOOTH: '부스',
  PUB: '주점',
  FOODTRUCK: '푸드트럭',
  MEDI: '의무실',
  BRACELET: '입장 팔찌',
  PHOTO: '포토부스',
  TRASH: '쓰레기통',
}

// Leaflet 이 문자열로 받아 그리므로 HTML 로 만든다. 모양은 user 앱 PlaceMarkers 의 markerHtml 과 같다
function markerHtml(code: PlaceCode, label: string | null) {
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
  code: PlaceCode
  sequence: number
  selected?: boolean
  onSelect?: () => void
  /** 툴팁처럼 마커에 붙일 것 */
  children?: ReactNode
}) {
  const markerRef = useRef<LeafletMarker>(null)
  const label = placeLabel(code, sequence)
  const name = label ? `${PLACE_NAMES[code]} ${label}` : PLACE_NAMES[code]
  // add 핸들러가 다시 만들어지지 않게 최신 선택·이름은 ref 로 읽는다
  const stateRef = useRef({ selected, name })

  // 아이콘을 다시 만들면 Leaflet 이 안을 갈아 끼워 링 전환이 끊기므로 모양 값이 바뀔 때만 만든다
  const icon = useMemo(
    () => divIcon({ html: markerHtml(code, label), className: styles.root, iconSize: [0, 0] }),
    [code, label],
  )
  const position = useMemo(() => toLatLng(point), [point])

  // Leaflet 뿌리 요소가 role=button 이라 이름·눌림 상태를 여기에 단다. 레이어가 다시 붙으면 요소가 새로 생겨 add 때도 부른다
  const sync = (marker: LeafletMarker | null) => {
    const element = marker?.getElement()
    element?.toggleAttribute('data-selected', stateRef.current.selected)
    element?.setAttribute('aria-pressed', String(stateRef.current.selected))
    element?.setAttribute('aria-label', stateRef.current.name)
    marker?.setZIndexOffset(stateRef.current.selected ? SELECTED_Z_OFFSET : 0)
  }

  useEffect(() => {
    stateRef.current = { selected, name }
    sync(markerRef.current)
  }, [selected, name])

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
        // Leaflet 은 마커에 포커스와 role=button 만 주고 Enter·Space 를 클릭으로 바꿔 주지 않는다
        keydown: ({ originalEvent }: LeafletKeyboardEvent) => {
          if (originalEvent.key !== 'Enter' && originalEvent.key !== ' ') return
          originalEvent.preventDefault()
          onSelect?.()
        },
        add: ({ target }: LeafletEvent) => sync(target as LeafletMarker),
      }}
    >
      {children}
    </Marker>
  )
}
