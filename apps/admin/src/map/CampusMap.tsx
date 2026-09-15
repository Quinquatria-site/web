import { CRS } from 'leaflet'
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

export interface CampusMapProps {
  /** 지도를 누르면 배치 도면 좌표를 돌려준다. 좌표 픽커 모드 */
  onPick?: (point: Point) => void
  /** 구역 A~D 사각형 표시 */
  showZones?: boolean
  children?: ReactNode
  className?: string
}

/**
 * user 앱(mock/design-system)의 campus-map 을 admin 용으로 단순화한 것.
 * 바텀시트·필터 없이 이미지 오버레이 + 마커(children) + 클릭 픽커만 남겼다.
 */
export function CampusMap({ onPick, showZones = true, children, className }: CampusMapProps) {
  return (
    <MapContainer
      className={className}
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
    </MapContainer>
  )
}
