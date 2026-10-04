import {
  divIcon,
  type LeafletEvent,
  type LeafletKeyboardEvent,
  type Map as LeafletMap,
  type Marker as LeafletMarker,
} from 'leaflet'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Marker, Tooltip, useMap } from 'react-leaflet'
import { toLatLng, type Point } from './campus'
import { CATEGORY_COLORS } from './category-colors'
import styles from './CampusMap.module.css'
import foodtruckIcon from './icons/foodtruck.svg'
import mediIcon from './icons/medi.svg'
import photoboothIcon from './icons/photobooth.svg'
import trashcanIcon from './icons/trashcan.svg'
import { PLACE_NAMES, placeLabel, type PlaceCode } from './place-label'

// 처음 전체 보기의 이 배수보다 확대해야 큰 물방울이 나온다. 그 아래는 작은 물방울만 찍고 누를 수 없다. user 앱과 같은 값
const FULL_MARKER_SCALE = 1.76

// 선택된 마커를 이웃 위로 올린다
const SELECTED_Z_OFFSET = 1000

// 손가락이 이만큼 안에서 떨어지면 끌기가 아니라 누름이다. 지도 끌기 판정(10px)과 맞춘다
const TAP_SLOP_PX = 10

// pointerup 으로 누름을 받은 뒤 같은 누름의 click 이 또 오면 버리는 시간
const CLICK_AFTER_TAP_MS = 600

function swallowNextClick() {
  const swallow = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
  }
  addEventListener('click', swallow, { capture: true, once: true })
  // 브라우저가 click 을 삼킨 탭이면 click 이 오지 않으니 다음 누름까지 막지 않게 걷는다
  setTimeout(() => removeEventListener('click', swallow, { capture: true }), CLICK_AFTER_TAP_MS)
}

/*
 * 크롬 안드로이드는 시트를 세게 던진 직후 첫 탭을 관성 멈춤으로 삼켜 click 을 만들지 않는다. user 앱 listenTap 과 같다.
 * pointerup 으로 받고, click 은 키보드·보조기기 몫으로 남긴다
 */
function listenTap(element: HTMLElement, onTap: () => void) {
  let start: { id: number; x: number; y: number } | null = null
  let lastTapAt = -Infinity
  element.addEventListener('pointerdown', (event) => {
    start = event.isPrimary ? { id: event.pointerId, x: event.clientX, y: event.clientY } : null
  })
  element.addEventListener('pointercancel', () => {
    start = null
  })
  element.addEventListener('pointerup', (event) => {
    if (!start || event.pointerId !== start.id) return
    const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y)
    start = null
    if (moved > TAP_SLOP_PX) return
    lastTapAt = event.timeStamp
    // 고르면 지도가 그 장소로 옮겨 가, 뒤따라오는 click 이 옮겨 온 빈 곳에 떨어져 방금 고른 장소를 푼다. 이 탭의 click 은 버린다
    swallowNextClick()
    onTap()
  })
  element.addEventListener('click', (event) => {
    // 마커 클릭이 지도까지 올라가면 마커를 눌러 연 시트가 빈 곳 탭으로 닫힌다
    event.stopPropagation()
    if (event.timeStamp - lastTapAt < CLICK_AFTER_TAP_MS) return
    onTap()
  })
}

// 구역 번호 대신 아이콘을 보여 주는 카테고리. user 앱과 같은 그림이고, size 는 각 svg 의 width·height 다
const PLACE_ICONS: Partial<Record<PlaceCode, { src: string; size: number }>> = {
  FOODTRUCK: { src: foodtruckIcon, size: 24 },
  MEDI: { src: mediIcon, size: 33.6 },
  PHOTOBOOTH: { src: photoboothIcon, size: 26.6 },
  TRASHCAN: { src: trashcanIcon, size: 29.4 },
}

// 원 가운데 (0,0), 반지름 19.5, 끝 (0,28.8) 인 물방울. 흰 테두리 3 을 이 선 가운데에 그려 바깥이 지름 42, 끝이 31 에 온다. 화면에는 지름 26 으로 줄여 그린다
const DROP_PATH = 'M-14.35 13.2L0 28.8L14.35 13.2A19.5 19.5 0 1 0-14.35 13.2Z'

// 지름 42 기준으로 만든 아이콘을 지름 26 물방울에 맞춰 줄이는 비율
const DROP_SCALE = 26 / 42

// 물방울 원 꼭대기가 좌표에서 32px 위라 툴팁을 그 위에 띄운다
const TOOLTIP_OFFSET: [number, number] = [0, -34]

/*
 * Leaflet 이 문자열로 받아 그리므로 HTML 로 만든다. 모양은 user 앱 PlaceMarkers 의 markerHtml 과 같고, 꼬리 끝이 장소 좌표를 찍는다.
 * 작은·큰 물방울을 한 마커에 두고 뿌리 data-full 로 하나만 보인다. 경계에서 마커를 갈아 끼우면 전부 지우고 다시 만들어 핀치가 끊긴다
 */
function markerHtml(code: PlaceCode, label: string | null) {
  const icon = PLACE_ICONS[code]
  // leaflet.css 가 마커 안 img 에 width:auto 를 걸어 width 속성이 먹지 않으니 style 로 준다
  const size = icon && icon.size * DROP_SCALE
  const content = icon
    ? `<img src="${icon.src}" style="width:${size}px;height:${size}px" alt="" draggable="false" />`
    : (label ?? '')
  return `<span class="${styles.marker}" style="--place-color:${CATEGORY_COLORS[code]}">
  <svg class="${styles.mini}" viewBox="-21 -21 42 53.5"><path d="${DROP_PATH}" /></svg>
  <span class="${styles.full}">
    <svg class="${styles.ring}" viewBox="-36 -36 72 72"><circle r="36" /><circle r="28" /></svg>
    <svg class="${styles.drop}" viewBox="-21 -21 42 52"><path d="${DROP_PATH}" /></svg>
    <span class="${styles.circle}">${content}</span>
  </span>
</span>`
}

interface MarkerState {
  selected: boolean
  name: string
  full: boolean
}

// Leaflet 뿌리 요소가 role=button 이라 이름·눌림 상태를 여기에 단다. 레이어가 다시 붙으면 요소가 새로 생겨 add 때도 부른다
// 작은 물방울일 땐 포커스·읽기에서 빼서 누를 수 없는 점으로 둔다
function syncMarker(marker: LeafletMarker, { selected, name, full }: MarkerState) {
  const element = marker.getElement()
  element?.toggleAttribute('data-selected', selected)
  element?.toggleAttribute('data-full', full)
  element?.setAttribute('aria-pressed', String(selected))
  element?.setAttribute('aria-label', name)
  element?.setAttribute('tabindex', full ? '0' : '-1')
  if (full) element?.removeAttribute('aria-hidden')
  else element?.setAttribute('aria-hidden', 'true')
  const zIndexOffset = selected ? SELECTED_Z_OFFSET : 0
  // setZIndexOffset 은 위치까지 다시 써서, 경계에서 마커가 함께 바뀔 때 값이 같으면 건너뛴다
  if (marker.options.zIndexOffset !== zIndexOffset) marker.setZIndexOffset(zIndexOffset)
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

interface PlaceMarkerProps {
  point: Point
  code: PlaceCode
  sequence: number
  selected?: boolean
  /** onSelect 에 돌려줄 장소 id */
  id?: number
  /** 없으면 누를 수 없는 마커가 되어 누름이 지도로 간다. 지도 목록에서 그대로 넘기도록 id 를 받는다 */
  onSelect?: (id: number) => void
  /** 마우스를 올리면 마커 위에 띄울 글 */
  tooltip?: string
}

/**
 * 장소 마커 하나. user 지도와 같은 물방울이고, 선택되면 두 겹 링이 퍼진다. 축소하면 작은 물방울이 되고,
 * 고른 장소는 축소해도 큰 물방울로 남아 시트가 가리키는 자리를 잃지 않는다.
 * 지도 목록이 선택을 바꿀 때마다 수십 개를 다시 그리지 않게 memo 로 묶는다
 */
export const PlaceMarker = memo(function PlaceMarker({
  point,
  code,
  sequence,
  selected = false,
  id,
  onSelect,
  tooltip,
}: PlaceMarkerProps) {
  const map = useMap()
  const zoomFull = useFullZoom()
  const full = zoomFull || selected
  const markerRef = useRef<LeafletMarker>(null)
  const label = placeLabel(code, sequence)
  const name = label ? `${PLACE_NAMES[code]} ${label}` : PLACE_NAMES[code]
  // add 핸들러가 다시 만들어지지 않게 최신 선택·이름·크기는 ref 로 읽는다
  const stateRef = useRef<MarkerState>({ selected, name, full })

  // 아이콘을 다시 만들면 Leaflet 이 안을 갈아 끼워 링 전환이 끊기므로 모양 값이 바뀔 때만 만든다
  const icon = useMemo(
    () => divIcon({ html: markerHtml(code, label), className: styles.root, iconSize: [0, 0] }),
    [code, label],
  )
  // 새 배열·객체를 넘기면 react-leaflet 이 다시 그릴 때마다 setLatLng·이벤트 재등록을 한다
  const { x, y } = point
  const position = useMemo(() => toLatLng({ x, y }), [x, y])
  const eventHandlers = useMemo(
    () => ({
      // Leaflet 은 마커에 포커스와 role=button 만 주고 Enter·Space 를 클릭으로 바꿔 주지 않는다
      keydown: ({ originalEvent }: LeafletKeyboardEvent) => {
        // 작은 물방울은 누를 수 없는 점이라 키로도 고르지 않는다
        if (!stateRef.current.full) return
        if (originalEvent.key !== 'Enter' && originalEvent.key !== ' ') return
        originalEvent.preventDefault()
        if (id !== undefined) onSelect?.(id)
      },
      add: ({ target }: LeafletEvent) => {
        syncMarker(target as LeafletMarker, stateRef.current)
        // Leaflet click 대신 직접 받는다. 다시 붙으면 요소가 새로 생겨 그때마다 단다. 누를 수 없는 마커(픽커 미리보기)엔 달지 않는다
        const element = (target as LeafletMarker).getElement()
        if (element && onSelect && id !== undefined) listenTap(element, () => onSelect(id))
      },
    }),
    [id, onSelect],
  )

  useEffect(() => {
    stateRef.current = { selected, name, full }
    if (!markerRef.current) return
    syncMarker(markerRef.current, stateRef.current)
    // tabindex 를 빼도 이미 잡힌 포커스는 남아, 작은 물방울이 되면 키보드가 이어지도록 지도 칸으로 옮긴다
    if (!full && markerRef.current.getElement()?.contains(document.activeElement))
      map.getContainer().focus({ preventScroll: true })
  }, [map, selected, name, full])

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={icon}
      interactive={Boolean(onSelect)}
      eventHandlers={eventHandlers}
    >
      {tooltip && (
        <Tooltip direction="top" offset={TOOLTIP_OFFSET}>
          {tooltip}
        </Tooltip>
      )}
    </Marker>
  )
})
