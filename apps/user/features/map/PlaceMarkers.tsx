'use client'

import {
  divIcon,
  type LeafletEvent,
  type LeafletKeyboardEvent,
  type Map as LeafletMap,
  type Marker as LeafletMarker,
} from 'leaflet'
import type { StaticImageData } from 'next/image'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Marker, useMap } from 'react-leaflet'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import braceletIcon from './images/bracelet.svg'
import foodtruckIcon from './images/foodtruck.svg'
import mediIcon from './images/medi.svg'
import photoboothIcon from './images/photobooth.svg'
import trashcanIcon from './images/trashcan.svg'
import { toLatLng } from './map-coords'
import { type MapPlace, type PlaceCode, type PlaceId, placeLabel } from './map-place'
import { PlaceArea } from './PlaceArea'
import { markerFill } from './place-colors'

// 처음 전체 보기의 이 배수보다 확대해야 큰 물방울이 나온다. 그 아래는 다닥다닥 붙어도 겹치지 않는 작은 물방울만 찍고 누를 수 없다
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
  // 크롬이 click 을 삼킨 탭이면 click 이 오지 않으니 다음 누름까지 막지 않게 걷는다
  setTimeout(() => removeEventListener('click', swallow, { capture: true }), CLICK_AFTER_TAP_MS)
}

// 크롬 안드로이드는 시트를 세게 던진 직후 첫 탭을 관성 멈춤으로 삼켜 click 을 만들지 않는다. pointerup 으로 받고, click 은 키보드·보조기기 몫으로 남긴다
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
    if (event.timeStamp - lastTapAt < CLICK_AFTER_TAP_MS) return
    onTap()
  })
}

// 구역 번호 대신 아이콘을 보여 주는 카테고리
const PLACE_ICONS: Partial<Record<PlaceCode, StaticImageData>> = {
  FOODTRUCK: foodtruckIcon,
  MEDI: mediIcon,
  BRACELET: braceletIcon,
  PHOTOBOOTH: photoboothIcon,
  TRASHCAN: trashcanIcon,
}

// 원 가운데 (0,0), 반지름 19.5, 끝 (0,28.8) 인 물방울. 흰 테두리 3 을 이 선 가운데에 그려 바깥이 지름 42, 끝이 31 에 온다. 화면에는 지름 26 으로 줄여 그린다
const DROP_PATH = 'M-14.35 13.2L0 28.8L14.35 13.2A19.5 19.5 0 1 0-14.35 13.2Z'

// 지름 42 기준으로 만든 아이콘을 지름 26 물방울에 맞춰 줄이는 비율
const DROP_SCALE = 26 / 42

// Leaflet 이 문자열로 받아 그리므로 JSX 대신 HTML 로 만든다. 크기 0 인 뿌리에 꼬리 끝을 맞춰 끝이 장소 좌표를 찍는다
// 선택되면 원 가운데에서 두 겹 링(34/44)이 퍼진다. leaflet.css 가 지도 안 svg 에 z-index 200 을 걸어 글자를 덮으니 z-auto! 로 되돌린다. 마커가 촘촘해서 터치 영역을 키우면 이웃을 가로채니 보이는 크기 그대로 둔다
// 작은·큰 물방울을 한 마커에 두고 뿌리 data-full 로 하나만 보인다. 경계에서 마커를 갈아 끼우면 전부 지우고 다시 만들어 핀치가 끊기고, 작은 쪽은 누름을 지도로 흘린다
function markerHtml(code: PlaceCode, label: string | null) {
  const icon = PLACE_ICONS[code]
  const fill = markerFill(code, label)
  // leaflet.css 가 마커 안 img 에 width:auto 를 걸어 width 속성이 먹지 않으니 style 로 준다
  const content = icon
    ? `<img src="${icon.src}" style="width:${icon.width * DROP_SCALE}px;height:${icon.height * DROP_SCALE}px" alt="" draggable="false" />`
    : label
  return `<span class="absolute">
  <svg class="pointer-events-none absolute z-auto! -top-[14px] -left-[5.5px] h-[14px] w-[11px] overflow-visible group-data-full:hidden" viewBox="-21 -21 42 53.5">
    <path d="${DROP_PATH}" stroke-width="4.5" stroke-miterlimit="10" class="${fill} stroke-white" />
  </svg>
  <span class="absolute hidden group-data-full:block">
    <svg class="pointer-events-none absolute z-auto! -top-[41px] -left-[22px] size-11 scale-68 opacity-0 transition-[scale,opacity] duration-120 ease-out group-data-selected:scale-100 group-data-selected:opacity-100 group-data-selected:duration-220 group-data-selected:ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:scale-100" viewBox="-36 -36 72 72">
      <circle r="36" class="${fill}" opacity=".2" />
      <circle r="28" class="${fill}" opacity=".2" />
    </svg>
    <svg class="absolute z-auto! -top-[32px] -left-[13px] h-[32px] w-[26px]" viewBox="-21 -21 42 52">
      <path d="${DROP_PATH}" stroke-width="3" class="${fill} stroke-white" />
    </svg>
    <span class="absolute -top-[32px] -left-[13px] grid size-[26px] place-items-center rounded-full font-sans text-[10.5px] leading-none font-semibold text-text-inverse outline-offset-2 outline-text group-focus-visible:outline-2">
      ${content}
    </span>
  </span>
</span>`
}

interface MarkerState {
  selected: boolean
  name: string
  full: boolean
}

// Leaflet 뿌리 요소가 role=button 이라 이름·눌림 상태를 여기에 단다. 레이어가 다시 붙으면 요소가 새로 생겨 add 때도 부른다
// 작은 물방울일 땐 포커스·읽기에서 빼서 예전처럼 누를 수 없는 점으로 둔다
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
  // setZIndexOffset 은 위치까지 다시 써서, 경계에서 73개가 함께 바뀔 때 값이 같으면 건너뛴다
  if (marker.options.zIndexOffset !== zIndexOffset) marker.setZIndexOffset(zIndexOffset)
}

/** 장소 마커 하나. 축소 땐 작은 물방울, 확대하거나 고르면 큰 물방울이고, 선택되면 바깥에 고유 색 링이 퍼진다 */
const PlaceMarker = memo(function PlaceMarker({
  place,
  name,
  selected,
  full,
  onSelect,
}: {
  place: MapPlace
  name: string
  selected: boolean
  /** 큰 물방울로 보일지 */
  full: boolean
  onSelect: (id: PlaceId) => void
}) {
  const { id, code, category_sequence, x, y } = place
  const map = useMap()
  const markerRef = useRef<LeafletMarker>(null)
  // add 핸들러가 다시 만들어지지 않게 최신 선택·이름·크기는 ref 로 읽는다
  const stateRef = useRef<MarkerState>({ selected, name, full })
  const label = placeLabel({ code, category_sequence })

  // 아이콘을 다시 만들면 Leaflet 이 안을 갈아 끼워 링 전환이 끊기므로, 모양에 쓰는 값이 바뀔 때만 만든다
  const icon = useMemo(
    () => divIcon({ html: markerHtml(code, label), className: 'group', iconSize: [0, 0] }),
    [code, label],
  )
  // 새 배열·객체를 넘기면 react-leaflet 이 선택 때마다 모든 마커에 setLatLng·이벤트 재등록을 한다
  const position = useMemo(() => toLatLng({ x, y }), [x, y])
  const eventHandlers = useMemo(
    () => ({
      // Leaflet 은 마커에 포커스와 role=button 만 주고 Enter·Space 를 클릭으로 바꿔 주지 않는다
      keydown: ({ originalEvent }: LeafletKeyboardEvent) => {
        // 작은 물방울은 누를 수 없는 점이라 키로도 고르지 않는다
        if (!stateRef.current.full) return
        if (originalEvent.key !== 'Enter' && originalEvent.key !== ' ') return
        originalEvent.preventDefault()
        onSelect(id)
      },
      add: ({ target }: LeafletEvent) => {
        syncMarker(target as LeafletMarker, stateRef.current)
        // Leaflet click 대신 직접 받는다. 다시 붙으면 요소가 새로 생겨 그때마다 단다
        const element = (target as LeafletMarker).getElement()
        if (element) listenTap(element, () => onSelect(id))
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

  return <Marker ref={markerRef} position={position} icon={icon} eventHandlers={eventHandlers} />
})

function isFullZoom(map: LeafletMap) {
  return map.getZoom() - map.getMinZoom() > Math.log2(FULL_MARKER_SCALE)
}

// 최소 배율은 화면 폭마다 달라서, 확대 정도를 최소 배율과의 차이로 잰다. 화면 크기가 바뀌면 최소 배율만 바뀌어 zoomlevelschange 도 듣는다
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

/** 지도 위 장소 마커들. 영역이 있는 장소는 폴리곤으로 그린다. 선택은 바텀 시트와 맞추도록 부모가 들고, 여기선 누름과 고른 장소가 목록에서 빠진 것만 알린다 */
export function PlaceMarkers({
  places,
  selectedId,
  onSelect,
  onClear,
}: {
  places: MapPlace[]
  selectedId: PlaceId | null
  onSelect: (id: PlaceId) => void
  onClear: () => void
}) {
  const names = getMessages(useLocale()).map.places
  const full = useFullZoom()
  // 필터 등으로 선택된 장소가 목록에서 빠지면 선택도 푼다. 두면 다시 나타날 때 누르지 않았는데 링이 켜져 있다
  const selectedGone = selectedId !== null && !places.some((place) => place.id === selectedId)
  useEffect(() => {
    if (selectedGone) onClear()
  }, [selectedGone, onClear])

  return (
    <>
      {places.map((place) => {
        const selected = place.id === selectedId
        // 영역은 축소해도 모양 그대로 보여야 해서 배율과 상관없이 그린다
        if (place.area)
          return (
            <PlaceArea
              key={place.id}
              place={place}
              area={place.area}
              selected={selected}
              onSelect={onSelect}
            />
          )
        const label = placeLabel(place)
        return (
          <PlaceMarker
            key={place.id}
            place={place}
            name={label ? `${names[place.code]} ${label}` : names[place.code]}
            selected={selected}
            // 고른 장소는 축소해도 큰 물방울로 남겨 시트가 가리키는 자리를 잃지 않는다
            full={full || selected}
            onSelect={onSelect}
          />
        )
      })}
    </>
  )
}
