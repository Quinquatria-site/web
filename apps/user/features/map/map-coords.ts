import type { LatLngBoundsLiteral, LatLngTuple } from 'leaflet'

/** 좌표 기준 크기. 지도 이미지(public/campus-map.webp) 픽셀과 같고, 이미지를 바꿔도 좌표를 지키려면 이 값은 두고 이미지를 맞춘다 */
export const MAP_WIDTH = 2000
export const MAP_HEIGHT = 1629

/** 지도 이미지 주소 */
export const MAP_IMAGE_URL = '/campus-map.webp'

/** 왼쪽 아래가 0,0 이고 위·오른쪽으로 커지는 지도 좌표 */
export interface MapPoint {
  x: number
  y: number
}

/** 이미지 전체 범위. Leaflet 은 [y, x] 순서다 */
export const MAP_BOUNDS: LatLngBoundsLiteral = [
  [0, 0],
  [MAP_HEIGHT, MAP_WIDTH],
]

/** 지도 좌표를 Leaflet 위치로. CRS.Simple 도 왼쪽 아래 원점이라 뒤집지 않고 순서만 바꾼다 */
export function toLatLng({ x, y }: MapPoint): LatLngTuple {
  return [y, x]
}
