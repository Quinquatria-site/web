import {
  divIcon,
  type LeafletEvent,
  type LeafletKeyboardEvent,
  type Map as LeafletMap,
  type Marker as LeafletMarker,
} from 'leaflet'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Marker, useMap } from 'react-leaflet'
import { toLatLng, type Point } from './campus'
import { CATEGORY_COLORS } from './category-colors'
import styles from './CampusMap.module.css'
import braceletIcon from './icons/bracelet.svg'
import foodtruckIcon from './icons/foodtruck.svg'
import mediIcon from './icons/medi.svg'
import photoIcon from './icons/photo.svg'
import trashIcon from './icons/trash.svg'
import { PLACE_NAMES, placeLabel, type PlaceCode } from './place-label'

// 처음 전체 보기의 이 배수보다 확대해야 큰 물방울이 나온다. 그 아래는 작은 물방울만 찍고 누를 수 없다. user 앱과 같은 값
const FULL_MARKER_SCALE = 1.76

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

// 원 가운데 (0,0), 반지름 19.5, 끝 (0,28.8) 인 물방울. 흰 테두리 3 을 이 선 가운데에 그려 바깥이 지름 42, 끝이 31 에 온다
const DROP_PATH = 'M-14.35 13.2L0 28.8L14.35 13.2A19.5 19.5 0 1 0-14.35 13.2Z'

// Leaflet 이 문자열로 받아 그리므로 HTML 로 만든다. 모양은 user 앱 PlaceMarkers 의 markerHtml 과 같고, 꼬리 끝이 장소 좌표를 찍는다
function markerHtml(code: PlaceCode, label: string | null) {
  const icon = PLACE_ICONS[code]
  const content = icon ? `<img src="${icon}" alt="" draggable="false" />` : (label ?? '')
  return `<span class="${styles.marker}" style="--place-color:${CATEGORY_COLORS[code]}">
  <svg class="${styles.ring}" viewBox="-36 -36 72 72"><circle r="36" /><circle r="28" /></svg>
  <svg class="${styles.drop}" viewBox="-21 -21 42 52">
    <path d="${DROP_PATH}" class="${styles.dropBase}" />
    <path d="${DROP_PATH}" class="${styles.dropTail}" />
    <circle r="19.5" class="${styles.dropFill}" />
    <path d="${DROP_PATH}" class="${styles.dropEdge}" />
  </svg>
  <span class="${styles.circle}">${content}</span>
</span>`
}

// 큰 물방울을 1/4 로 줄인 폭 11 짜리. user 앱 miniMarkerHtml 과 같다
function miniMarkerHtml(code: PlaceCode) {
  return `<svg class="${styles.mini}" style="--place-color:${CATEGORY_COLORS[code]}" viewBox="-21 -21 42 53.5"><path d="${DROP_PATH}" /></svg>`
}

function isFullZoom(map: LeafletMap) {
  return map.getZoom() - map.getMinZoom() > Math.log2(FULL_MARKER_SCALE)
}

// 최소 배율은 화면 폭마다 달라서 확대 정도를 최소 배율과의 차이로 잰다. 화면 크기가 바뀌면 최소 배율만 바뀌어 zoomlevelschange 도 듣는다
function useFullZoom() {
  const map = useMap()
  const [full, setFull] = useState(() => isFullZoom(map))

  useEffect(() => {
    const update = () => setFull(isFullZoom(map))
    update()
    map.on('zoom zoomlevelschange', update)
    return () => {
      map.off('zoom zoomlevelschange', update)
    }
  }, [map])

  return full
}

/** 축소 때 찍는 작은 물방울. 누르거나 포커스할 수 없다 */
function MiniMarker({ point, code }: { point: Point; code: PlaceCode }) {
  const icon = useMemo(
    () => divIcon({ html: miniMarkerHtml(code), className: styles.root, iconSize: [0, 0] }),
    [code],
  )
  const position = useMemo(() => toLatLng(point), [point])
  return <Marker position={position} icon={icon} interactive={false} keyboard={false} />
}

/** 장소 마커 하나. user 지도와 같은 물방울이고, 선택되면 두 겹 링이 퍼진다. 축소하면 고른 것만 남기고 작은 물방울이 된다 */
export function PlaceMarker(props: PlaceMarkerProps) {
  const full = useFullZoom()
  // 고른 장소는 축소해도 큰 물방울로 남겨 시트가 가리키는 자리를 잃지 않는다
  if (!full && !props.selected) return <MiniMarker point={props.point} code={props.code} />
  return <FullMarker {...props} />
}

interface PlaceMarkerProps {
  point: Point
  code: PlaceCode
  sequence: number
  selected?: boolean
  onSelect?: () => void
  /** 툴팁처럼 마커에 붙일 것 */
  children?: ReactNode
}

function FullMarker({
  point,
  code,
  sequence,
  selected = false,
  onSelect,
  children,
}: PlaceMarkerProps) {
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
