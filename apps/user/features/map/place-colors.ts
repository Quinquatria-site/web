import type { PlaceCode } from './map-place'

/** 카테고리 고유 색 배경. Tailwind 가 클래스 이름을 찾아야 해서 조합하지 않고 통째로 적는다 */
export const PLACE_BG: Record<PlaceCode, string> = {
  BOOTH: 'bg-place-booth',
  PUB: 'bg-place-pub',
  FOODTRUCK: 'bg-place-foodtruck',
  MEDI: 'bg-place-medi',
  BRACELET: 'bg-place-bracelet',
  PHOTO: 'bg-place-photo',
  TRASH: 'bg-place-trash',
}

/** 선택 링 배경. 고유 색 52% */
export const PLACE_RING_BG: Record<PlaceCode, string> = {
  BOOTH: 'bg-place-booth/52',
  PUB: 'bg-place-pub/52',
  FOODTRUCK: 'bg-place-foodtruck/52',
  MEDI: 'bg-place-medi/52',
  BRACELET: 'bg-place-bracelet/52',
  PHOTO: 'bg-place-photo/52',
  TRASH: 'bg-place-trash/52',
}
