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
}

/** 물방울 마커 꼬리 채움. 고유 색 52% */
export const PLACE_TAIL_FILL: Record<PlaceCode, string> = {
  BOOTH: 'fill-place-booth/52',
  PUB: 'fill-place-pub/52',
  FOODTRUCK: 'fill-place-foodtruck/52',
  MEDI: 'fill-place-medi/52',
  BRACELET: 'fill-place-bracelet/52',
  PHOTOBOOTH: 'fill-place-photobooth/52',
  TRASHCAN: 'fill-place-trashcan/52',
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
}
