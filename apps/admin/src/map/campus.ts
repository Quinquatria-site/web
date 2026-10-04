import type { LatLngBoundsLiteral, LatLngTuple } from 'leaflet'

/*
 * user 앱 features/map/map-coords.ts 와 같은 좌표 계약이다. admin 이 저장한 장소 x·y 를
 * user 지도가 그대로 읽으므로 두 파일의 값이 달라지면 학생 지도에 장소가 엉뚱하게 찍힌다.
 * 한쪽을 바꾸면 다른 쪽도 같이 바꾼다.
 */

/** 좌표 기준 크기. 지도 이미지(public/campus-map.webp) 픽셀과 같다 */
export const MAP_WIDTH = 1399
export const MAP_HEIGHT = 1124

/** 지도 이미지 주소. user 앱과 같은 파일이다 */
export const MAP_IMAGE_URL = '/campus-map.webp'

/** 왼쪽 아래가 0,0 이고 위·오른쪽으로 커지는 지도 좌표. 서버 장소의 x·y 가 이것이다 */
export type Point = { x: number; y: number }

/** 이미지 전체 범위. Leaflet 은 [y, x] 순서다 */
export const MAP_BOUNDS: LatLngBoundsLiteral = [
  [0, 0],
  [MAP_HEIGHT, MAP_WIDTH],
]

/** 지도 좌표를 Leaflet 위치로. CRS.Simple 도 왼쪽 아래 원점이라 뒤집지 않고 순서만 바꾼다 */
export function toLatLng({ x, y }: Point): LatLngTuple {
  return [y, x]
}

/** 소수 첫째 자리까지, 이미지 범위 안으로 */
const snap = (value: number, max: number) => Math.round(Math.min(Math.max(value, 0), max) * 10) / 10

/** Leaflet 클릭 지점 → 저장할 지도 좌표. 이미지 여백을 눌러도 범위 밖 좌표가 나가지 않게 가둔다 */
export function fromLatLng({ lat, lng }: { lat: number; lng: number }): Point {
  return { x: snap(lng, MAP_WIDTH), y: snap(lat, MAP_HEIGHT) }
}

/** 장소의 점 좌표. 구역 장소이거나 아직 정하지 않았으면 null 이라 마커를 찍지 않는다 */
export function placePoint({ x, y }: { x: number | null; y: number | null }): Point | null {
  return x === null || y === null ? null : { x, y }
}

/** 구역 꼭짓점들의 평균. 구역 장소를 고를 때 화면을 옮길 기준점이다. user 앱 get-places.ts 의 centerOf 와 같다 */
export function areaCenter(area: Point[]): Point {
  const sum = area.reduce((acc, { x, y }) => ({ x: acc.x + x, y: acc.y + y }), { x: 0, y: 0 })
  return { x: sum.x / area.length, y: sum.y / area.length }
}

/** 장소를 가리키는 점. 구역 장소는 꼭짓점 가운데, 점 장소는 좌표다. 위치가 아직 없으면 null */
export function placeAnchor(place: {
  is_polygon: boolean
  x: number | null
  y: number | null
  area: Point[] | null
}): Point | null {
  if (place.is_polygon) return place.area?.length ? areaCenter(place.area) : null
  return placePoint(place)
}
