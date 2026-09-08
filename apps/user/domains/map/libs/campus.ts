import type { LatLngBoundsExpression, LatLngTuple } from 'leaflet'

export const IMAGE_URL = '/campus-map.png'
export const IMAGE_WIDTH = 1402
export const IMAGE_HEIGHT = 1122

export type Point = { x: number; y: number }
export type Rect = Point & { width: number; height: number }

// 데이터는 이미지처럼 좌상단 원점이고, Leaflet 은 좌하단 원점이라 y 를 뒤집는다.
export function toLatLng({ x, y }: Point): LatLngTuple {
  return [IMAGE_HEIGHT - y, x]
}

export type ZoneId = 'A' | 'B' | 'C' | 'D'

/** 구역 사각형도 부스와 같은 배치 도면 좌표계다. */
export const ZONES: { id: ZoneId; rect: Rect }[] = [
  { id: 'A', rect: { x: 73, y: 44, width: 92, height: 61 } },
  { id: 'B', rect: { x: 59, y: 118, width: 67, height: 120 } },
  { id: 'C', rect: { x: 127, y: 100, width: 136, height: 24 } },
  { id: 'D', rect: { x: 253, y: 56, width: 64, height: 45 } },
]

export function toBounds({ x, y, width, height }: Rect): LatLngBoundsExpression {
  return [toLatLng({ x, y: y + height }), toLatLng({ x: x + width, y })]
}

export const IMAGE_BOUNDS = toBounds({ x: 0, y: 0, width: IMAGE_WIDTH, height: IMAGE_HEIGHT })

/**
 * 부스 좌표는 390 × 329 배치 도면 기준이고 지도 이미지는 1402 × 1122 다.
 * 두 그림의 여백이 달라서 배율만으로는 안 맞는다. 화면을 보며 아래 네 값을 맞춘다.
 */
export const SOURCE_WIDTH = 390
export const SOURCE_HEIGHT = 329

export const FIT = {
  scaleX: IMAGE_WIDTH / SOURCE_WIDTH,
  scaleY: IMAGE_HEIGHT / SOURCE_HEIGHT,
  offsetX: 0,
  offsetY: 0,
}

export function fromSource({ x, y }: Point): Point {
  return { x: x * FIT.scaleX + FIT.offsetX, y: y * FIT.scaleY + FIT.offsetY }
}

export function boundsFromSource({ x, y, width, height }: Rect): LatLngBoundsExpression {
  const start = fromSource({ x, y })
  const end = fromSource({ x: x + width, y: y + height })
  return toBounds({
    x: start.x,
    y: start.y,
    width: end.x - start.x,
    height: end.y - start.y,
  })
}
