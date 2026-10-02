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
import { PLACE_FILL, PLACE_TAIL_FILL } from './place-colors'

// 처음 전체 보기의 이 배수보다 확대해야 큰 물방울이 나온다. 그 아래는 다닥다닥 붙어도 겹치지 않는 작은 물방울만 찍고 누를 수 없다
const FULL_MARKER_SCALE = 1.76

// 선택된 마커를 이웃 위로 올린다
const SELECTED_Z_OFFSET = 1000

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

// Leaflet 이 문자열로 받아 그리므로 JSX 대신 HTML 로 만든다. 크기 0 인 뿌리에 꼬리 끝을 맞춰 끝이 장소 좌표를 찍는다
// 선택되면 원 가운데에서 두 겹 링(34/44)이 퍼진다. leaflet.css 가 지도 안 svg 에 z-index 200 을 걸어 글자를 덮으니 z-auto! 로 되돌린다. 마커가 촘촘해서 터치 영역을 키우면 이웃을 가로채니 보이는 크기 그대로 둔다
function markerHtml(code: PlaceCode, label: string | null) {
  const icon = PLACE_ICONS[code]
  const content = icon
    ? `<img src="${icon.src}" width="15" height="15" alt="" draggable="false" />`
    : label
  return `<span class="absolute">
  <svg class="pointer-events-none absolute z-auto! -top-[41px] -left-[22px] size-11 scale-68 opacity-0 transition-[scale,opacity] duration-120 ease-out group-data-selected:scale-100 group-data-selected:opacity-100 group-data-selected:duration-220 group-data-selected:ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:scale-100" viewBox="-36 -36 72 72">
    <circle r="36" class="${PLACE_FILL[code]}" opacity=".2" />
    <circle r="28" class="${PLACE_FILL[code]}" opacity=".2" />
  </svg>
  <svg class="absolute z-auto! -top-[32px] -left-[13px] h-[32px] w-[26px]" viewBox="-21 -21 42 52">
    <path d="${DROP_PATH}" class="fill-white" />
    <path d="${DROP_PATH}" class="${PLACE_TAIL_FILL[code]}" />
    <circle r="19.5" class="${PLACE_FILL[code]}" />
    <path d="${DROP_PATH}" fill="none" stroke-width="3" class="stroke-white" />
  </svg>
  <span class="absolute -top-[32px] -left-[13px] grid size-[26px] place-items-center rounded-full font-sans text-[10.5px] leading-none font-semibold text-text-inverse outline-offset-2 outline-text group-focus-visible:outline-2">
    ${content}
  </span>
</span>`
}

// 큰 물방울과 같은 모양의 폭 11 짜리. 같은 물방울이라 확대할 때 모양이 이어지고 꼬리 끝이 같은 자리를 찍는다
function miniMarkerHtml(code: PlaceCode) {
  return `<svg class="absolute z-auto! -top-[14px] -left-[5.5px] h-[14px] w-[11px] overflow-visible" viewBox="-21 -21 42 53.5">
  <path d="${DROP_PATH}" stroke-width="4.5" stroke-miterlimit="10" class="${PLACE_FILL[code]} stroke-white" />
</svg>`
}

// Leaflet 뿌리 요소가 role=button 이라 이름·눌림 상태를 여기에 단다. 레이어가 다시 붙으면 요소가 새로 생겨 add 때도 부른다
function syncMarker(marker: LeafletMarker, selected: boolean, name: string) {
  const element = marker.getElement()
  element?.toggleAttribute('data-selected', selected)
  element?.setAttribute('aria-pressed', String(selected))
  element?.setAttribute('aria-label', name)
  marker.setZIndexOffset(selected ? SELECTED_Z_OFFSET : 0)
}

/** 장소 마커 하나. 선택되면 바깥에 고유 색 링이 퍼진다 */
const PlaceMarker = memo(function PlaceMarker({
  place,
  name,
  selected,
  onSelect,
}: {
  place: MapPlace
  name: string
  selected: boolean
  onSelect: (id: PlaceId) => void
}) {
  const { id, code, category_sequence, x, y } = place
  const markerRef = useRef<LeafletMarker>(null)
  // add 핸들러가 다시 만들어지지 않게 최신 선택·이름은 ref 로 읽는다
  const stateRef = useRef({ selected, name })
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
      click: () => onSelect(id),
      // Leaflet 은 마커에 포커스와 role=button 만 주고 Enter·Space 를 클릭으로 바꿔 주지 않는다
      keydown: ({ originalEvent }: LeafletKeyboardEvent) => {
        if (originalEvent.key !== 'Enter' && originalEvent.key !== ' ') return
        originalEvent.preventDefault()
        onSelect(id)
      },
      add: ({ target }: LeafletEvent) => {
        syncMarker(target as LeafletMarker, stateRef.current.selected, stateRef.current.name)
      },
    }),
    [id, onSelect],
  )

  useEffect(() => {
    stateRef.current = { selected, name }
    if (markerRef.current) syncMarker(markerRef.current, selected, name)
  }, [selected, name])

  return <Marker ref={markerRef} position={position} icon={icon} eventHandlers={eventHandlers} />
})

/** 축소 때 찍는 작은 물방울. 누르거나 포커스할 수 없다 */
const MiniMarker = memo(function MiniMarker({ place }: { place: MapPlace }) {
  const { code, x, y } = place
  const icon = useMemo(
    () => divIcon({ html: miniMarkerHtml(code), className: '', iconSize: [0, 0] }),
    [code],
  )
  const position = useMemo(() => toLatLng({ x, y }), [x, y])
  return <Marker position={position} icon={icon} interactive={false} keyboard={false} />
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
        // 고른 장소는 축소해도 큰 물방울로 남겨 시트가 가리키는 자리를 잃지 않는다
        if (!full && !selected) return <MiniMarker key={place.id} place={place} />
        const label = placeLabel(place)
        return (
          <PlaceMarker
            key={place.id}
            place={place}
            name={label ? `${names[place.code]} ${label}` : names[place.code]}
            selected={selected}
            onSelect={onSelect}
          />
        )
      })}
    </>
  )
}
