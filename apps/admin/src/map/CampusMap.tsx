import { CRS, type Map as LeafletMap } from 'leaflet'
import { useEffect, type ReactNode } from 'react'
import { ImageOverlay, MapContainer, Rectangle, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import {
  boundsFromSource,
  IMAGE_BOUNDS,
  IMAGE_URL,
  SOURCE_HEIGHT,
  SOURCE_WIDTH,
  toSource,
  ZONES,
  type Point,
} from './campus'
import 'leaflet/dist/leaflet.css'

/** 이미지 지도라 위경도가 아니라 픽셀 좌표(CRS.Simple)를 쓴다 */
function FitToImage() {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(IMAGE_BOUNDS)
  }, [map])
  return null
}

/** 소수 첫째 자리까지, 도면 범위 안으로 */
const snap = (value: number, max: number) => Math.round(Math.min(Math.max(value, 0), max) * 10) / 10

function PickLayer({ onPick }: { onPick: (point: Point) => void }) {
  useMapEvents({
    click: (event) => {
      const { x, y } = toSource(event.latlng)
      // 배치 도면 좌표로 저장한다. user 앱이 같은 좌표계를 읽는다.
      // 이미지 여백을 눌러도 도면 밖 좌표가 나가지 않게 가둔다
      onPick({ x: snap(x, SOURCE_WIDTH), y: snap(y, SOURCE_HEIGHT) })
    },
  })
  return null
}

/**
 * 마커가 아닌 빈 곳을 눌렀을 때.
 *
 * 마커(CircleMarker)는 Path 라 기본값이 bubblingMouseEvents: true 다. 그대로
 * 두면 마커 클릭이 여기까지 올라와, 마커를 눌러 연 시트가 같은 클릭으로 바로
 * 닫힌다. 마커 쪽에서 bubblingMouseEvents: false 로 끊어야 한다.
 */
function BackgroundClick({ onClick }: { onClick: () => void }) {
  useMapEvents({ click: onClick })
  return null
}

export interface CampusMapProps {
  /** 지도를 누르면 배치 도면 좌표를 돌려준다. 좌표 픽커 모드 */
  onPick?: (point: Point) => void
  /** 구역 A~D 사각형 표시 */
  showZones?: boolean
  /** 마커가 아닌 빈 곳 클릭. 시트 닫기에 쓴다 */
  onBackgroundClick?: () => void
  /** 지도 인스턴스를 밖으로 넘긴다. 시트가 덮는 만큼 영역을 줄일 때 쓴다 */
  onMapReady?: (map: LeafletMap | null) => void
  children?: ReactNode
  className?: string
}

/**
 * user 앱(mock/design-system)의 campus-map 을 admin 용으로 단순화한 것.
 * 바텀시트·필터 없이 이미지 오버레이 + 마커(children) + 클릭 픽커만 남겼다.
 */
export function CampusMap({
  onPick,
  showZones = true,
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
      bounds={IMAGE_BOUNDS}
      maxBounds={IMAGE_BOUNDS}
      maxBoundsViscosity={1}
      minZoom={-2}
      maxZoom={2}
      zoomSnap={0.25}
      attributionControl={false}
      style={{ width: '100%', height: '100%', background: 'var(--seed-color-bg-layer-basement)' }}
    >
      <FitToImage />
      <ImageOverlay url={IMAGE_URL} bounds={IMAGE_BOUNDS} />
      {showZones &&
        ZONES.map((zone) => (
          <Rectangle
            key={zone.id}
            bounds={boundsFromSource(zone.rect)}
            pathOptions={{ color: '#002D56', weight: 1, dashArray: '6 4', fillOpacity: 0.04 }}
          >
            <Tooltip permanent direction="center" opacity={0.75}>
              {zone.id}
            </Tooltip>
          </Rectangle>
        ))}
      {children}
      {onPick && <PickLayer onPick={onPick} />}
      {onBackgroundClick && <BackgroundClick onClick={onBackgroundClick} />}
    </MapContainer>
  )
}
