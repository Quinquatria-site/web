import { CRS } from 'leaflet'
import { useEffect, useRef, type ReactNode } from 'react'
import { ImageOverlay, MapContainer, useMap, useMapEvents } from 'react-leaflet'
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

/* 아래 값과 FitCampus·TrackpadPinchZoom·FocusPlace·DragWatch 는 user 앱 features/map/CampusMap.tsx 와 같다 */

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

/** 손으로 지도를 끄는 동안을 알린다. 시트가 그동안 아래로 비켜 지도를 가리지 않는다 */
function DragWatch({ onDragChange }: { onDragChange: (dragging: boolean) => void }) {
  useMapEvents({
    dragstart: () => onDragChange(true),
    dragend: () => onDragChange(false),
  })
  return null
}

function PickLayer({ onPick }: { onPick: (point: Point) => void }) {
  useMapEvents({
    click: (event) => {
      // user 앱이 같은 좌표계(이미지 픽셀, 왼쪽 아래 원점)로 읽는다
      onPick(fromLatLng(event.latlng))
    },
  })
  return null
}

/**
 * 마커가 아닌 빈 곳을 눌렀을 때.
 *
 * 마커 클릭이 여기까지 올라오면 마커를 눌러 연 시트가 같은 클릭으로 바로 닫힌다.
 * PlaceMarker 가 클릭을 여기서 끊는다.
 */
function BackgroundClick({ onClick }: { onClick: () => void }) {
  useMapEvents({ click: onClick })
  return null
}

export interface CampusMapProps {
  /** 지도를 누르면 배치 도면 좌표를 돌려준다. 좌표 픽커 모드 */
  onPick?: (point: Point) => void
  /** 마커가 아닌 빈 곳 클릭. 시트 닫기에 쓴다 */
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
      <ImageOverlay url={MAP_IMAGE_URL} bounds={MAP_BOUNDS} />
      <CampusLabels />
      <FitCampus bottomInset={focus ? bottomInset : 0} />
      <TrackpadPinchZoom />
      {children}
      <FocusPlace point={focus} request={focusRequest} bottomInset={bottomInset} />
      {onDragChange && <DragWatch onDragChange={onDragChange} />}
      {onPick && <PickLayer onPick={onPick} />}
      {onBackgroundClick && <BackgroundClick onClick={onBackgroundClick} />}
      <ZoomButtons />
    </MapContainer>
  )
}
