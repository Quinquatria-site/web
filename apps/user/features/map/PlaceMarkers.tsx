'use client'

import {
  divIcon,
  type LeafletEvent,
  type LeafletKeyboardEvent,
  type Marker as LeafletMarker,
} from 'leaflet'
import type { StaticImageData } from 'next/image'
import { memo, useEffect, useMemo, useRef } from 'react'
import { Marker, useMap, useMapEvents } from 'react-leaflet'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import braceletIcon from './images/bracelet.svg'
import foodtruckIcon from './images/foodtruck.svg'
import mediIcon from './images/medi.svg'
import photoIcon from './images/photo.svg'
import trashIcon from './images/trash.svg'
import { toLatLng } from './map-coords'
import { type MapPlace, type PlaceCode, placeLabel } from './map-place'

/** 이 배율부터 점이 글자·아이콘 든 마커로 커진다. 쓰면서 맞춘다 */
export const FULL_MARKER_ZOOM = -1

// 선택된 마커를 이웃 위로 올린다
const SELECTED_Z_OFFSET = 1000

// Tailwind 가 클래스 이름을 찾아야 해서 조합하지 않고 통째로 적는다. 링은 고유 색 52%
const PLACE_STYLES: Record<PlaceCode, { dot: string; ring: string; icon?: StaticImageData }> = {
  BOOTH: { dot: 'bg-place-booth', ring: 'bg-place-booth/52' },
  PUB: { dot: 'bg-place-pub', ring: 'bg-place-pub/52' },
  FOODTRUCK: { dot: 'bg-place-foodtruck', ring: 'bg-place-foodtruck/52', icon: foodtruckIcon },
  MEDI: { dot: 'bg-place-medi', ring: 'bg-place-medi/52', icon: mediIcon },
  BRACELET: { dot: 'bg-place-bracelet', ring: 'bg-place-bracelet/52', icon: braceletIcon },
  PHOTO: { dot: 'bg-place-photo', ring: 'bg-place-photo/52', icon: photoIcon },
  TRASH: { dot: 'bg-place-trash', ring: 'bg-place-trash/52', icon: trashIcon },
}

// Leaflet 이 문자열로 받아 그리므로 JSX 대신 HTML 로 만든다. 크기 0 인 뿌리에 가운데를 맞추고, 링(62/42)은 마커 크기에 비례해 둘러싼다. 점은 촘촘해서 터치 영역을 키우면 이웃 점을 가로채니 보이는 크기 그대로 둔다
function markerHtml(code: PlaceCode, label: string | null) {
  const { dot, ring, icon } = PLACE_STYLES[code]
  const content = icon
    ? `<img src="${icon.src}" width="${icon.width}" height="${icon.height}" alt="" draggable="false" />`
    : label
  return `<span class="absolute size-5 -translate-1/2 in-data-[markers=full]:size-[42px]">
  <span class="pointer-events-none absolute inset-[-23.8%] rounded-full ${ring} scale-68 opacity-0 transition-[scale,opacity] duration-120 ease-out group-data-selected:scale-100 group-data-selected:opacity-100 group-data-selected:duration-220 group-data-selected:ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:scale-100"></span>
  <span class="absolute inset-0 grid place-items-center rounded-full ${dot} font-sans text-[17px] leading-none font-semibold text-text-inverse outline-offset-2 outline-text group-focus-visible:outline-2">
    <span class="hidden in-data-[markers=full]:contents">${content}</span>
  </span>
</span>`
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
  onSelect: (id: number) => void
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

// 배율에 따라 지도 칸에 data-markers 를 달아 마커가 CSS 만으로 점·전체 모양을 오가게 한다
function MarkerZoomLevel() {
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

/** 지도 위 장소 마커들. 선택은 바텀 시트와 맞추도록 부모가 들고, 여기선 누름·빈 곳 클릭만 알린다 */
export function PlaceMarkers({
  places,
  selectedId,
  onSelect,
  onClear,
}: {
  places: MapPlace[]
  selectedId: number | null
  onSelect: (id: number) => void
  onClear: () => void
}) {
  const names = getMessages(useLocale()).map.places
  // 마커 클릭은 지도로 번지지 않아서 여기엔 빈 곳 클릭만 온다
  useMapEvents({ click: onClear })

  // 필터 등으로 선택된 장소가 목록에서 빠지면 선택도 푼다. 두면 다시 나타날 때 누르지 않았는데 링이 켜져 있다
  const selectedGone = selectedId !== null && !places.some((place) => place.id === selectedId)
  useEffect(() => {
    if (selectedGone) onClear()
  }, [selectedGone, onClear])

  return (
    <>
      <MarkerZoomLevel />
      {places.map((place) => {
        const label = placeLabel(place)
        return (
          <PlaceMarker
            key={place.id}
            place={place}
            name={label ? `${names[place.code]} ${label}` : names[place.code]}
            selected={place.id === selectedId}
            onSelect={onSelect}
          />
        )
      })}
    </>
  )
}
