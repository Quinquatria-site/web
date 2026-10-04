import type { PlaceCode } from './map-place'

/** 카테고리 고유 색 배경. Tailwind 가 클래스 이름을 찾아야 해서 조합하지 않고 통째로 적는다 */
export const PLACE_BG: Record<PlaceCode, string> = {
  BOOTH: 'bg-place-booth',
  PUB: 'bg-place-pub',
  FOODTRUCK: 'bg-place-foodtruck',
  MEDI: 'bg-place-medi',
  BRACELET: 'bg-place-bracelet',
  PHOTOBOOTH: 'bg-place-photobooth',
  TRASHCAN: 'bg-place-trashcan',
  ENTRANCE: 'bg-place-entrance',
  PROMOTION: 'bg-place-promotion',
}

/** 물방울 마커 원과 선택 링 채움. 고유 색 */
export const PLACE_FILL: Record<PlaceCode, string> = {
  BOOTH: 'fill-place-booth',
  PUB: 'fill-place-pub',
  FOODTRUCK: 'fill-place-foodtruck',
  MEDI: 'fill-place-medi',
  BRACELET: 'fill-place-bracelet',
  PHOTOBOOTH: 'fill-place-photobooth',
  TRASHCAN: 'fill-place-trashcan',
  ENTRANCE: 'fill-place-entrance',
  PROMOTION: 'fill-place-promotion',
}

// 학생회가 여는 부스. id 는 DB 마다 달라 마커 글자로 찾는다
const COUNCIL_BOOTH_LABELS: ReadonlySet<string> = new Set(['C2', 'C3', 'C4'])

/** 물방울 마커와 선택 링 채움. 학생회 부스만 부스색 대신 하늘색이다 */
export function markerFill(code: PlaceCode, label: string | null) {
  return code === 'BOOTH' && label && COUNCIL_BOOTH_LABELS.has(label)
    ? 'fill-place-council'
    : PLACE_FILL[code]
}

/** 영역 테두리. 고유 색 */
export const PLACE_STROKE: Record<PlaceCode, string> = {
  BOOTH: 'stroke-place-booth',
  PUB: 'stroke-place-pub',
  FOODTRUCK: 'stroke-place-foodtruck',
  MEDI: 'stroke-place-medi',
  BRACELET: 'stroke-place-bracelet',
  PHOTOBOOTH: 'stroke-place-photobooth',
  TRASHCAN: 'stroke-place-trashcan',
  ENTRANCE: 'stroke-place-entrance',
  PROMOTION: 'stroke-place-promotion',
}
