export type PlaceKind = 'pub' | 'aid'

export type Place = {
  id: string
  kind: PlaceKind
  name: string
  /** 배치 도면 좌표 (390 × 329), 좌상단 원점 */
  x: number
  y: number
}

// 실제 위치는 아직 정해지지 않았다. 자리만 잡아둔 값이다.
export const PLACES: Place[] = [
  { id: 'pub-1', kind: 'pub', name: '[주점 1]', x: 97, y: 185 },
  { id: 'pub-2', kind: 'pub', name: '[주점 2]', x: 231, y: 144 },
  { id: 'pub-3', kind: 'pub', name: '[주점 3]', x: 263, y: 182 },
  { id: 'pub-4', kind: 'pub', name: '[주점 4]', x: 125, y: 255 },
  { id: 'pub-5', kind: 'pub', name: '[주점 5]', x: 293, y: 160 },
  { id: 'aid-1', kind: 'aid', name: '[의무실 1]', x: 60, y: 100 },
  { id: 'aid-2', kind: 'aid', name: '[의무실 2]', x: 200, y: 150 },
  { id: 'aid-3', kind: 'aid', name: '[의무실 3]', x: 270, y: 235 },
]
