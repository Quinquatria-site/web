import {
  Bounds,
  CRS,
  DomUtil,
  ImageOverlay,
  type LatLng,
  type LatLngBounds,
  type Map as LeafletMap,
  type ZoomAnimEvent,
} from 'leaflet'
import { useEffect, useRef, type ReactNode } from 'react'
import { MapContainer, useMap, useMapEvents } from 'react-leaflet'
import { CampusLabels } from './CampusLabels'
import {
  fromLatLng,
  MAP_BOUNDS,
  MAP_HEIGHT,
  MAP_IMAGE_URL,
  MAP_WIDTH,
  toLatLng,
  type Point,
} from './campus'
import styles from './CampusMap.module.css'
import { ZoomButtons } from './ZoomButtons'
import 'leaflet/dist/leaflet.css'

/*
 * 아래 값과 FitCampus·TrackpadPinchZoom·PinchZoomRelease·FocusPlace·EmptyTap·DragWatch·DragTolerance·
 * ScaledImageOverlay 는 user 앱 features/map/CampusMap.tsx 와 같다. 한쪽 손동작을 고치면 다른 쪽도 같이 고친다
 */

// 이미지 1px 이 화면 2px 까지 커진다. 그 이상은 흐려진다
const MAX_ZOOM = 1

// 기본 최소 배율 0 이 전체 맞춤 계산까지 잘라 먹어서, 계산 전에는 충분히 낮춰 둔다
const FLOOR_ZOOM = -5

// 핀치 휠 1px 당 확대 단계. 120px 쯤 벌리면 두 배가 된다
const PINCH_ZOOM_PER_PX = 0.01

/**
 * 처음엔 캠퍼스 전체가 화면에 들어오게 두고 그보다 작아지지 않게 막는다. 화면보다 작은 방향은
 * 범위를 화면 크기로 넓혀 아예 못 움직이게 한다 — Leaflet 기본은 끌게 두고 손을 떼야 되돌린다.
 * 아래를 시트가 가리는 동안은 그 높이만큼 더 밀 수 있게 열어 둔다. user 와 달리 위를 가리는 칩은 없다.
 */
function FitCampus({ bottomInset }: { bottomInset: number }) {
  const map = useMap()
  const insetRef = useRef(bottomInset)
  const lockRef = useRef<() => void>(undefined)

  useEffect(() => {
    const fit = () => {
      map.setMinZoom(FLOOR_ZOOM)
      map.setMinZoom(map.getBoundsZoom(MAP_BOUNDS))
    }
    const lockShortAxis = () => {
      const { x, y } = map.getSize()
      const scale = map.getZoomScale(map.getZoom(), 0)
      const padX = Math.max(0, (x / scale - MAP_WIDTH) / 2)
      const padY = Math.max(0, (y / scale - MAP_HEIGHT) / 2)
      // 시트가 아래를 가리는 동안은 그 높이만큼 지도를 위로 올릴 수 있어야 아래쪽 장소가 시트 위로 나온다
      map.setMaxBounds([
        [-padY - insetRef.current / scale, -padX],
        [MAP_HEIGHT + padY, MAP_WIDTH + padX],
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
    insetRef.current = bottomInset
    lockRef.current?.()
  }, [bottomInset])

  return null
}

/** 트랙패드 핀치는 ctrlKey 붙은 작은 휠로 들어와 Leaflet 기본으로는 거의 안 커져서 따로 받는다 */
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

/** 고른 장소를 지금 배율 그대로 시트 위 남은 화면 가운데로 옮긴다 */
function FocusPlace({
  point,
  request,
  bottomInset,
}: {
  point: Point | null
  request: number
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
      const zoom = map.getZoom()
      // 시트 위 가운데에 오도록 시트 높이의 절반만큼 중심을 아래로 잡는다
      const center = map.project(toLatLng(point), zoom).add([0, bottomInset / 2])
      map.setView(map.unproject(center, zoom), zoom)
    }
    if (zoomingRef.current) pendingRef.current = focus
    else focus()
    // request 는 같은 장소를 다시 눌러도 다시 옮기려고 받는다
  }, [map, point, request, bottomInset])

  return null
}

// Leaflet 내부 메서드. 공개 API 가 없어 1.9.4 기준으로 쓴다 — 올릴 때 이름·동작을 다시 확인한다
type ZoomTransitionMap = LeafletMap & { _onZoomTransitionEnd: () => void }

/** 핀치는 손을 뗄 때 배율이 이미 맞아 있는데도 Leaflet 이 확대 전환을 다시 걸어 250ms 동안 끌기를 막아서, 핀치 끝 전환만 바로 끝낸다 */
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

/** 손으로 지도를 끄는 동안을 알린다. 시트가 그동안 숨었다가 끝나면 다시 보인다 */
function DragWatch({ onDragChange }: { onDragChange: (dragging: boolean) => void }) {
  const map = useMap()
  const onDragChangeRef = useRef(onDragChange)
  useEffect(() => {
    onDragChangeRef.current = onDragChange
  })

  useEffect(() => {
    let dragging = false
    const start = () => {
      dragging = true
      onDragChangeRef.current(true)
    }
    const end = () => {
      if (!dragging) return
      dragging = false
      onDragChangeRef.current(false)
    }
    // 끄는 중 두 번째 손가락이 닿으면 Leaflet 이 dragend 없이 끌기를 끝내서, 손가락이 다 떨어질 때도 끝낸다
    const release = (event: TouchEvent) => {
      if (event.touches.length === 0) end()
    }
    map.on('dragstart', start)
    map.on('dragend', end)
    document.addEventListener('touchend', release)
    document.addEventListener('touchcancel', release)
    return () => {
      map.off('dragstart', start)
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

// 두 번 탭은 확대라서, 한 번 탭은 두 번째 탭이 오지 않을 만큼 기다렸다가 알린다. 모바일 브라우저의 두 번 탭 판정(약 300ms)에 맞춘다
const DOUBLE_TAP_WAIT_MS = 300

/** 좌표 픽커. 기다리지 않고 바로 찍되, 두 번 탭 확대의 두 번째 탭은 같은 자리라 버린다 */
function PickLayer({ onPick }: { onPick: (point: Point) => void }) {
  const lastPickRef = useRef(-Infinity)
  useMapEvents({
    click: (event) => {
      const at = event.originalEvent.timeStamp
      const repeat = at - lastPickRef.current < DOUBLE_TAP_WAIT_MS
      lastPickRef.current = at
      if (repeat) return
      // user 앱이 같은 좌표계(이미지 픽셀, 왼쪽 아래 원점)로 읽는다
      onPick(fromLatLng(event.latlng))
    },
  })
  return null
}

/**
 * 지도 빈 곳 한 번 탭을 알린다. 마커 누름은 지도로 번지지 않아 여기엔 빈 곳만 온다.
 * 두 번 탭 확대로 시트가 닫히지 않게 두 번째 탭을 기다렸다가 알린다
 */
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

/** 캠퍼스 그림. 이름표·마커 아래에 깐다 */
function MapImage() {
  const map = useMap()

  useEffect(() => {
    const layer = new ScaledImageOverlay(MAP_IMAGE_URL, MAP_BOUNDS).addTo(map)
    layer.bringToBack()
    return () => {
      layer.remove()
    }
  }, [map])

  return null
}

export interface CampusMapProps {
  /** 지도를 누르면 배치 도면 좌표를 돌려준다. 좌표 픽커 모드 */
  onPick?: (point: Point) => void
  /** 마커가 아닌 빈 곳 한 번 탭. 두 번 탭(확대)과 구분하려 300ms 늦게 온다. 시트 닫기에 쓴다 */
  onBackgroundClick?: () => void
  /** 고른 장소. 시트 위 남은 화면 가운데로 옮긴다 */
  focus?: Point | null
  /** 장소를 고를 때마다 늘어나는 수. 같은 장소를 다시 눌러도 다시 옮긴다 */
  focusRequest?: number
  /** 장소를 고른 동안 시트가 아래를 가리는 높이 */
  bottomInset?: number
  /** 손으로 지도를 끄는 동안. 시트를 잠깐 숨길 때 쓴다 */
  onDragChange?: (dragging: boolean) => void
  children?: ReactNode
  className?: string
}

/**
 * user 앱 features/map 의 캠퍼스 지도를 admin 용으로 줄인 것. 같은 이미지·좌표·이름표·마커
 * 모양을 쓰고, 필터 없이 마커(children)·클릭 픽커·고른 장소 옮기기만 둔다.
 */
export function CampusMap({
  onPick,
  onBackgroundClick,
  focus = null,
  focusRequest = 0,
  bottomInset = 0,
  onDragChange,
  children,
  className,
}: CampusMapProps) {
  return (
    <MapContainer
      className={`${styles.container} ${className ?? ''}`}
      crs={CRS.Simple}
      bounds={MAP_BOUNDS}
      maxBoundsViscosity={1}
      maxZoom={MAX_ZOOM}
      zoomSnap={0}
      zoomControl={false}
      attributionControl={false}
      style={{ width: '100%', height: '100%' }}
    >
      <MapImage />
      <CampusLabels />
      <FitCampus bottomInset={focus ? bottomInset : 0} />
      <TrackpadPinchZoom />
      <PinchZoomRelease />
      {children}
      <FocusPlace point={focus} request={focusRequest} bottomInset={bottomInset} />
      {onDragChange && <DragWatch onDragChange={onDragChange} />}
      <DragTolerance />
      {onPick && <PickLayer onPick={onPick} />}
      {onBackgroundClick && <EmptyTap onTap={onBackgroundClick} cancelKey={focusRequest} />}
      <ZoomButtons />
    </MapContainer>
  )
}
