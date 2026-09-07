import type { LatLngBoundsExpression, LatLngTuple } from 'leaflet'

export const IMAGE_URL = '/campus.svg'
export const IMAGE_WIDTH = 390
export const IMAGE_HEIGHT = 329

export type Point = { x: number; y: number }
export type Rect = Point & { width: number; height: number }

export type SectionId = 'A' | 'B' | 'C' | 'D'
export type Section = { id: SectionId; label: string; rect: Rect }

export const SECTIONS: Section[] = [
  { id: 'A', label: 'A', rect: { x: 73, y: 44, width: 92, height: 61 } },
  { id: 'B', label: 'B', rect: { x: 59, y: 118, width: 67, height: 120 } },
  { id: 'C', label: 'C', rect: { x: 127, y: 100, width: 136, height: 24 } },
  { id: 'D', label: 'D', rect: { x: 253, y: 56, width: 64, height: 45 } },
]

// 데이터는 Figma 처럼 좌상단 원점이고, Leaflet 은 좌하단 원점이라 y 를 뒤집는다.
export function toLatLng({ x, y }: Point): LatLngTuple {
  return [IMAGE_HEIGHT - y, x]
}

export function toBounds({ x, y, width, height }: Rect): LatLngBoundsExpression {
  return [toLatLng({ x, y: y + height }), toLatLng({ x: x + width, y })]
}

export const IMAGE_BOUNDS = toBounds({ x: 0, y: 0, width: IMAGE_WIDTH, height: IMAGE_HEIGHT })
