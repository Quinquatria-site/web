'use client'

import {
  Bounds,
  CRS,
  DomUtil,
  ImageOverlay,
  type LatLng,
  type LatLngBounds,
  type Map as LeafletMap,
  Marker,
  type ZoomAnimEvent,
} from 'leaflet'
import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, useMap, useMapEvents } from 'react-leaflet'
import {
  MAP_BOUNDS,
  MAP_HEIGHT,
  MAP_IMAGE_URL,
  MAP_WIDTH,
  type MapPoint,
  toLatLng,
} from './map-coords'
import { MapControls } from './MapControls'
import { MapLabels } from './MapLabels'
import type { MapPlace, PlaceId } from './map-place'
import { PlaceMarkers } from './PlaceMarkers'
import { StageArea } from './StageArea'
import 'leaflet/dist/leaflet.css'

// 이미지 1px 이 화면 2px 까지 커진다. 그 이상은 흐려진다
const MAX_ZOOM = 1

// 기본 최소 배율 0 이 전체 맞춤 계산까지 잘라 먹어서, 계산 전에는 충분히 낮춰 둔다
const FLOOR_ZOOM = -5

// 처음엔 캠퍼스 전체가 화면에 들어오게 두고, 그보다 작아지지 않게 막는다. 위아래를 가린 높이만큼은 더 밀 수 있게 열어 둔다
function FitCampus({ topInset, bottomInset }: { topInset: number; bottomInset: number }) {
  const map = useMap()
  const insetRef = useRef({ top: topInset, bottom: bottomInset })
  const lockRef = useRef<() => void>(undefined)

  useEffect(() => {
    const fit = () => {
      map.setMinZoom(FLOOR_ZOOM)
      map.setMinZoom(map.getBoundsZoom(MAP_BOUNDS))
    }
    // 화면보다 작은 방향은 Leaflet 이 이미지가 화면 안에 머무는 만큼 끌게 두고 손을 떼야 되돌려서, 범위를 화면 크기로 넓혀 아예 못 움직이게 한다
    const lockShortAxis = () => {
      const { x, y } = map.getSize()
      const scale = map.getZoomScale(map.getZoom(), 0)
      const padX = Math.max(0, (x / scale - MAP_WIDTH) / 2)
      const padY = Math.max(0, (y / scale - MAP_HEIGHT) / 2)
      // 시트가 아래를 가리는 동안은 그 높이만큼 지도를 위로 올릴 수 있어야 아래쪽 장소가 시트 위로 나온다
      // 위는 칩이 늘 가리는데, 전체 보기처럼 지도 위에 빈 곳이 이미 있으면 잠금을 풀지 않도록 모자란 만큼만 연다
      map.setMaxBounds([
        [-padY - insetRef.current.bottom / scale, -padX],
        [MAP_HEIGHT + Math.max(padY, insetRef.current.top / scale), MAP_WIDTH + padX],
      ])
    }
    lockRef.current = lockShortAxis
    fit()
    map.setView([MAP_HEIGHT / 2, MAP_WIDTH / 2], map.getMinZoom(), { animate: false })
    lockShortAxis()
    map.on('resize', fit)
    map.on('zoomend resize', lockShortAxis)
    return () => {
      map.off('resize', fit)
      map.off('zoomend resize', lockShortAxis)
    }
  }, [map])

  useEffect(() => {
    insetRef.current = { top: topInset, bottom: bottomInset }
    lockRef.current?.()
  }, [topInset, bottomInset])

  return null
}

// 핀치 휠 1px 당 확대 단계. 120px 쯤 벌리면 두 배가 된다
const PINCH_ZOOM_PER_PX = 0.01

// 트랙패드 핀치는 ctrlKey 붙은 작은 휠로 들어와 Leaflet 기본(60px 당 1단계·40ms 묶음)으로는 거의 안 커져서 따로 받는다
function TrackpadPinchZoom() {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return
      // capture 에서 멈춰 Leaflet 휠 확대와 브라우저 페이지 확대가 겹치지 않게 한다
      event.preventDefault()
      event.stopPropagation()
      map.setZoomAround(
        map.mouseEventToContainerPoint(event),
        map.getZoom() - event.deltaY * PINCH_ZOOM_PER_PX,
        { animate: false },
      )
    }
    container.addEventListener('wheel', handleWheel, { capture: true, passive: false })
    return () => container.removeEventListener('wheel', handleWheel, { capture: true })
  }, [map])

  return null
}

// Leaflet 내부 메서드. 공개 API 가 없어 1.9.4 기준으로 쓴다 — 올릴 때 이름·동작을 다시 확인한다
type ZoomTransitionMap = LeafletMap & { _onZoomTransitionEnd: () => void }

// 핀치는 손을 뗄 때 배율이 이미 맞아 있는데도 Leaflet 이 확대 전환을 다시 걸어 250ms 동안 끌기를 막아서, 핀치 끝 전환만 바로 끝낸다
function PinchZoomRelease() {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    let pinching = false
    // 두 손가락이 닿았던 터치만 핀치로 본다. 한 손가락으로 새로 닿으면 두 번 탭 확대처럼 애니메이션이 필요한 경로라 푼다
    const handleTouchStart = (event: TouchEvent) => {
      pinching = event.touches.length >= 2
    }
    const handleZoomAnim = () => {
      if (!pinching) return
      pinching = false
      // 전환을 거는 Leaflet 터치 처리가 다 끝난 뒤에 끝내야 다른 레이어의 zoomanim 처리를 건너뛰지 않는다
      queueMicrotask(() => (map as ZoomTransitionMap)._onZoomTransitionEnd())
    }
    container.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true })
    map.on('zoomanim', handleZoomAnim)
    return () => {
      container.removeEventListener('touchstart', handleTouchStart, { capture: true })
      map.off('zoomanim', handleZoomAnim)
    }
  }, [map])

  return null
}

// 장소 주소나 검색으로 고른 장소는 큰 물방울이 보이도록 전체 보기의 이 배수까지 확대한다
const FOCUS_SCALE = 3

/** 고른 장소로 옮겨 달라는 요청. count 는 같은 장소를 다시 골라도 다시 옮기려고 늘리고, zoom 이면 그 장소로 확대도 한다 */
export interface FocusRequest {
  count: number
  zoom: boolean
}

// 고른 장소를 위 칩과 아래 시트 사이 남은 화면 가운데로 옮긴다. 지도에서 누른 장소는 배율을 그대로 두고, 장소 주소로 들어오거나 검색으로 고른 장소는 확대한다
function FocusPlace({
  point,
  request,
  topInset,
  bottomInset,
}: {
  point: MapPoint | null
  request: FocusRequest
  topInset: number
  bottomInset: number
}) {
  const map = useMap()
  const zoomingRef = useRef(false)
  const pendingRef = useRef<() => void>(undefined)

  // 확대 전환 중에 다시 옮기면 끝날 때 이전 자리로 돌아가서, 전환이 끝난 뒤 마지막 요청만 옮긴다
  useEffect(() => {
    const start = () => {
      zoomingRef.current = true
    }
    const end = () => {
      zoomingRef.current = false
      const pending = pendingRef.current
      pendingRef.current = undefined
      pending?.()
    }
    map.on('zoomstart', start)
    map.on('zoomend', end)
    return () => {
      map.off('zoomstart', start)
      map.off('zoomend', end)
    }
  }, [map])

  useEffect(() => {
    pendingRef.current = undefined
    if (!point) return
    const focus = () => {
      const zoom = request.zoom
        ? Math.max(map.getZoom(), map.getMinZoom() + Math.log2(FOCUS_SCALE))
        : map.getZoom()
      // 칩과 시트 사이 가운데에 오도록, 두 높이 차의 절반만큼 중심을 아래로 잡는다
      const center = map.project(toLatLng(point), zoom).add([0, (bottomInset - topInset) / 2])
      map.setView(map.unproject(center, zoom), zoom)
    }
    if (zoomingRef.current) pendingRef.current = focus
    else focus()
  }, [map, point, request, topInset, bottomInset])

  return null
}

// 두 번 탭은 확대라서, 한 번 탭은 두 번째 탭이 오지 않을 만큼 기다렸다가 알린다. 모바일 브라우저의 두 번 탭 판정(약 300ms)에 맞춘다
const DOUBLE_TAP_WAIT_MS = 300

// 지도 빈 곳 한 번 탭을 알린다. 마커 누름은 지도로 번지지 않아 여기엔 빈 곳만 온다
function EmptyTap({ onTap, cancelKey }: { onTap: () => void; cancelKey: number }) {
  const map = useMap()
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const onTapRef = useRef(onTap)
  useEffect(() => {
    onTapRef.current = onTap
  })
  useMapEvents({
    click: () => {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => onTapRef.current(), DOUBLE_TAP_WAIT_MS)
    },
    dblclick: () => clearTimeout(timerRef.current),
  })
  // 기다리는 사이 마커를 고르면, 늦게 온 빈 곳 탭이 방금 고른 장소를 풀지 않게 버린다
  useEffect(() => clearTimeout(timerRef.current), [cancelKey])
  useEffect(() => () => clearTimeout(timerRef.current), [])

  // 키보드로도 같은 일을 하게 지도 칸에 포커스가 있을 때 Enter·Space 를 받는다. 마커에서 올라온 키는 마커 몫이다
  useEffect(() => {
    const container = map.getContainer()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target !== container || (event.key !== 'Enter' && event.key !== ' ')) return
      event.preventDefault()
      onTapRef.current()
    }
    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [map])

  return null
}

// 손으로 지도를 끄는 동안을 알린다. 끄는 사이 확대가 끼었으면(핀치) 끝날 때 함께 알린다
function DragWatch({
  onDragChange,
}: {
  onDragChange: (dragging: boolean, zoomed: boolean) => void
}) {
  const map = useMap()
  const onDragChangeRef = useRef(onDragChange)
  useEffect(() => {
    onDragChangeRef.current = onDragChange
  })

  useEffect(() => {
    let dragging = false
    let zoomed = false
    const start = () => {
      dragging = true
      zoomed = false
      onDragChangeRef.current(true, false)
    }
    const zoom = () => {
      zoomed = true
    }
    const end = () => {
      if (!dragging) return
      dragging = false
      onDragChangeRef.current(false, zoomed)
    }
    // 끄는 중 두 번째 손가락이 닿으면 Leaflet 이 dragend 없이 끌기를 끝내서, 손가락이 다 떨어질 때도 끝낸다
    const release = (event: TouchEvent) => {
      if (event.touches.length === 0) end()
    }
    map.on('dragstart', start)
    map.on('zoomstart', zoom)
    map.on('dragend', end)
    document.addEventListener('touchend', release)
    document.addEventListener('touchcancel', release)
    return () => {
      map.off('dragstart', start)
      map.off('zoomstart', zoom)
      map.off('dragend', end)
      document.removeEventListener('touchend', release)
      document.removeEventListener('touchcancel', release)
    }
  }, [map])

  return null
}

// Leaflet 내부 끌기 객체. 지도 옵션으로 넘길 길이 없어 1.9.4 기준으로 쓴다 — 올릴 때 이름·동작을 다시 확인한다
type DraggableMap = LeafletMap & {
  dragging: { _draggable?: { options: { clickTolerance: number } } }
}

// 기본 3px 은 마우스 기준이라, 손가락 탭이 조금만 밀려도 끌기가 되어 마커 누름이 버려진다
const DRAG_TOLERANCE_PX = 10

function widenDragTolerance(map: LeafletMap) {
  const draggable = (map as DraggableMap).dragging._draggable
  if (draggable) draggable.options.clickTolerance = DRAG_TOLERANCE_PX
}

function DragTolerance() {
  const map = useMap()

  useEffect(() => widenDragTolerance(map), [map])

  return null
}

// 지도는 살짝 커지며 드러나고, 마커는 그 뒤 위쪽부터 차례로 떨어진다. 장소가 많아도 마지막 마커가 늦게 오지 않게 간격 합을 묶는다
const REVEAL_EASE = 'cubic-bezier(.22,1,.36,1)'
const MAP_REVEAL_MS = 600
const MARKER_REVEAL_AT = 550
const MARKER_REVEAL_MS = 360
const MARKER_STAGGER_MS = 50
const MARKER_STAGGER_MAX = 500

// Leaflet 내부 메서드. 공개 API 가 없어 1.9.4 기준으로 쓴다 — 올릴 때 이름·동작을 다시 확인한다
type NewBoundsMap = LeafletMap & {
  _latLngBoundsToNewLayerBounds: (bounds: LatLngBounds, zoom: number, center: LatLng) => Bounds
}

// 기본 ImageOverlay 는 핀치 매 프레임 width·height 를 바꿔 레이아웃과 이미지 다시 그리기가 돈다. 원본 크기로 고정하고 transform 배율로만 키운다
class ScaledImageOverlay extends ImageOverlay {
  onAdd(map: LeafletMap) {
    super.onAdd(map)
    const image = this.getElement()
    if (image) {
      // CRS.Simple 배율 0 에서 좌표 1 이 1px 이라 이미지 원본 크기가 배율 0 크기다
      image.style.width = `${MAP_WIDTH}px`
      image.style.height = `${MAP_HEIGHT}px`
      image.style.transformOrigin = '0 0'
    }
    return this
  }

  // 원래 getEvents 가 이 이름으로 zoom·viewreset 을 묶어 두어 덮어쓴다
  _reset() {
    const image = this.getElement()
    if (!image || !this._map) return
    const origin = this._map.latLngToLayerPoint(this.getBounds().getNorthWest())
    DomUtil.setTransform(image, origin, this._map.getZoomScale(this._map.getZoom(), 0))
  }

  // 버튼·두 번 탭 확대 전환. 원래는 지금 크기 기준 배율이라 배율 0 기준으로 바꾼다
  _animateZoom({ zoom, center }: ZoomAnimEvent) {
    const image = this.getElement()
    if (!image || !this._map) return
    const map = this._map as NewBoundsMap
    const { min } = map._latLngBoundsToNewLayerBounds(this.getBounds(), zoom, center)
    if (min) DomUtil.setTransform(image, min, map.getZoomScale(zoom, 0))
  }
}

// 마커는 HTML 에 실려 와 바로 그려지고 이미지는 뒤늦게 받아져서, 이미지를 다 받을 때까지 지도 판 전체를 숨겨 두었다가 드러낸다
function MapImage() {
  const map = useMap()
  const revealedRef = useRef(false)

  useEffect(() => {
    map.getPane('mapPane')?.style.setProperty('opacity', '0')
  }, [map])

  const eventHandlers = useMemo(() => {
    const reveal = () => {
      if (revealedRef.current) return
      revealedRef.current = true
      const pane = map.getPane('mapPane')
      if (!pane) return
      pane.style.removeProperty('opacity')
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
      const { x, y } = map.getSize()
      // 판 자체는 크기 0 이라 지도 칸 가운데를 기준으로 키운다. scale 속성은 Leaflet 이 끌기에 쓰는 transform 과 따로 논다
      pane.style.transformOrigin = `${x / 2}px ${y / 2}px`
      pane.animate(
        reduce
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [
              { opacity: 0, scale: 0.96 },
              { opacity: 1, scale: 1 },
            ],
        { duration: MAP_REVEAL_MS, easing: REVEAL_EASE },
      )
      if (reduce) return
      const markers: Marker[] = []
      map.eachLayer((layer) => {
        if (layer instanceof Marker && layer.options.pane === 'markerPane') markers.push(layer)
      })
      markers.sort((a, b) => b.getLatLng().lat - a.getLatLng().lat)
      const step =
        markers.length > 1
          ? Math.min(MARKER_STAGGER_MS, MARKER_STAGGER_MAX / (markers.length - 1))
          : 0
      markers.forEach((marker, i) => {
        marker.getElement()?.firstElementChild?.animate(
          [
            { opacity: 0, translate: '0 -14px' },
            { opacity: 1, translate: '0 0' },
          ],
          {
            duration: MARKER_REVEAL_MS,
            delay: MARKER_REVEAL_AT + i * step,
            easing: REVEAL_EASE,
            fill: 'backwards',
          },
        )
      })
    }
    // 받지 못해도 마커는 보여야 해서 실패 때도 드러낸다
    return { load: reveal, error: reveal }
  }, [map])

  useEffect(() => {
    const layer = new ScaledImageOverlay(MAP_IMAGE_URL, MAP_BOUNDS).on(eventHandlers).addTo(map)
    // 다시 붙어도 같은 판의 장소 영역 폴리곤을 덮지 않게 맨 아래로 깐다
    layer.bringToBack()
    return () => {
      layer.remove()
    }
  }, [map, eventHandlers])

  return null
}

/** 캠퍼스 지도. 이미지 한 장을 픽셀 좌표(CRS.Simple)로 깔고 끌기·확대를 받으며, 장소 마커를 올린다 */
export default function CampusMap({
  places,
  selectedId,
  onSelect,
  onClear,
  focusRequest,
  topInset,
  bottomInset,
  onDragChange,
  onEmptyTap,
}: {
  places: MapPlace[]
  selectedId: PlaceId | null
  onSelect: (id: PlaceId) => void
  onClear: () => void
  focusRequest: FocusRequest
  /** 지도 위를 늘 가리는 검색 막대 · 칩 층 높이 */
  topInset: number
  /** 장소를 고른 동안 아래를 가리는 높이. 고른 장소를 이만큼 위로 비켜 둔다 */
  bottomInset: number
  onDragChange: (dragging: boolean, zoomed: boolean) => void
  onEmptyTap: () => void
}) {
  const selected = places.find((place) => place.id === selectedId) ?? null

  return (
    <MapContainer
      crs={CRS.Simple}
      bounds={MAP_BOUNDS}
      maxBoundsViscosity={1}
      maxZoom={MAX_ZOOM}
      zoomSnap={0}
      zoomControl={false}
      attributionControl={false}
      // 배경은 페이지의 노을 하늘이 비친다. leaflet.css 의 #ddd 가 뒤에 실려 ! 로 지운다
      className="size-full bg-transparent!"
    >
      <MapImage />
      <StageArea />
      <MapLabels />
      <FitCampus topInset={topInset} bottomInset={selected ? bottomInset : 0} />
      <TrackpadPinchZoom />
      <PinchZoomRelease />
      <PlaceMarkers places={places} selectedId={selectedId} onSelect={onSelect} onClear={onClear} />
      <FocusPlace
        point={selected}
        request={focusRequest}
        topInset={topInset}
        bottomInset={bottomInset}
      />
      <DragWatch onDragChange={onDragChange} />
      <DragTolerance />
      <EmptyTap onTap={onEmptyTap} cancelKey={focusRequest.count} />
      <MapControls />
    </MapContainer>
  )
}
