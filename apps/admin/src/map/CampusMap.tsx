import { CRS, type Map as LeafletMap } from 'leaflet'
import { useEffect, type ReactNode } from 'react'
import { ImageOverlay, MapContainer, useMap, useMapEvents } from 'react-leaflet'
import { CampusLabels } from './CampusLabels'
import { fromLatLng, MAP_BOUNDS, MAP_IMAGE_URL, type Point } from './campus'
import { MarkerZoomLevel } from './PlaceMarker'
import 'leaflet/dist/leaflet.css'

/** 이미지 지도라 위경도가 아니라 픽셀 좌표(CRS.Simple)를 쓴다 */
function FitToImage() {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(MAP_BOUNDS)
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
      className={className}
      ref={onMapReady}
      crs={CRS.Simple}
      bounds={MAP_BOUNDS}
      maxBounds={MAP_BOUNDS}
      maxBoundsViscosity={1}
      minZoom={-2}
      maxZoom={2}
      zoomSnap={0.25}
      attributionControl={false}
      style={{ width: '100%', height: '100%', background: 'var(--seed-color-bg-layer-basement)' }}
    >
      <FitToImage />
      <ImageOverlay url={MAP_IMAGE_URL} bounds={MAP_BOUNDS} />
      <CampusLabels />
      <MarkerZoomLevel />
      {children}
      {onPick && <PickLayer onPick={onPick} />}
      {onBackgroundClick && <BackgroundClick onClick={onBackgroundClick} />}
    </MapContainer>
  )
}
