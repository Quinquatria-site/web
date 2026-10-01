import { CRS, type Map as LeafletMap } from 'leaflet'
import { useEffect, type ReactNode } from 'react'
import { ImageOverlay, MapContainer, useMap, useMapEvents } from 'react-leaflet'
import { CampusLabels } from './CampusLabels'
import { fromLatLng, MAP_BOUNDS, MAP_HEIGHT, MAP_IMAGE_URL, MAP_WIDTH, type Point } from './campus'
import styles from './CampusMap.module.css'
import { MarkerZoomLevel } from './PlaceMarker'
import { ZoomButtons } from './ZoomButtons'
import 'leaflet/dist/leaflet.css'

/* 아래 값과 FitCampus·TrackpadPinchZoom 은 user 앱 features/map/CampusMap.tsx 와 같다 */

// 이미지 1px 이 화면 2px 까지 커진다. 그 이상은 흐려진다
const MAX_ZOOM = 1

// 기본 최소 배율 0 이 전체 맞춤 계산까지 잘라 먹어서, 계산 전에는 충분히 낮춰 둔다
const FLOOR_ZOOM = -5

// 핀치 휠 1px 당 확대 단계. 120px 쯤 벌리면 두 배가 된다
const PINCH_ZOOM_PER_PX = 0.01

/**
 * 처음엔 캠퍼스 전체가 화면에 들어오게 두고 그보다 작아지지 않게 막는다. 화면보다 작은 방향은
 * 범위를 화면 크기로 넓혀 아예 못 움직이게 한다 — Leaflet 기본은 끌게 두고 손을 떼야 되돌린다.
 * user 와 달리 위를 가리는 칩·아래 시트 여백은 없다(admin 시트는 지도 칸 자체를 줄인다).
 */
function FitCampus() {
  const map = useMap()

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
      map.setMaxBounds([
        [-padY, -padX],
        [MAP_HEIGHT + padY, MAP_WIDTH + padX],
      ])
    }
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
  /** 지도 인스턴스를 밖으로 넘긴다. 시트가 덮는 만큼 영역을 줄일 때 쓴다 */
  onMapReady?: (map: LeafletMap | null) => void
  children?: ReactNode
  className?: string
}

/**
 * user 앱 features/map 의 캠퍼스 지도를 admin 용으로 줄인 것. 같은 이미지·좌표·이름표·마커
 * 모양을 쓰고, 바텀시트·필터 없이 마커(children)와 클릭 픽커만 둔다.
 */
export function CampusMap({
  onPick,
  onBackgroundClick,
  onMapReady,
  children,
  className,
}: CampusMapProps) {
  return (
    <MapContainer
      className={`${styles.container} ${className ?? ''}`}
      ref={onMapReady}
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
      <FitCampus />
      <TrackpadPinchZoom />
      <MarkerZoomLevel />
      {children}
      {onPick && <PickLayer onPick={onPick} />}
      {onBackgroundClick && <BackgroundClick onClick={onBackgroundClick} />}
      <ZoomButtons />
    </MapContainer>
  )
}
