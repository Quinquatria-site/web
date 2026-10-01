import type { CategoryCode } from '../mocks/types'

/**
 * 지도 마커 종류. 서버 카테고리에 곧 붙을 포토부스·쓰레기통까지 더했다.
 * user 앱 features/map/map-place.ts 의 PlaceCode 와 같고, 두 이름은 서버 코드가 정해지면 맞춘다
 */
export type PlaceCode = CategoryCode | 'PHOTO' | 'TRASH'

// 구역 번호를 쓰는 카테고리. 나머지는 category_sequence 가 그냥 표시 순서다
const SECTION_CODES: ReadonlySet<PlaceCode> = new Set(['BOOTH', 'PUB'])

/**
 * 마커 글자. category_sequence 백의 자리가 구역(1 → A), 나머지 두 자리가 번호라 101 은 A1 이다.
 * user 앱 features/map/map-place.ts 의 placeLabel 과 같은 규칙이다. 구역이 없는 카테고리는 null
 */
export function placeLabel(code: PlaceCode, sequence: number): string | null {
  if (!SECTION_CODES.has(code)) return null
  const section = String.fromCharCode(64 + Math.floor(sequence / 100))
  return `${section}${sequence % 100}`
}
