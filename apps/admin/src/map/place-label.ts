import type { CategoryCode } from '../mocks/types'

/** 지도 마커 종류. 서버 카테고리 코드와 같다 */
export type PlaceCode = CategoryCode

/** 장소 종류 이름. user messages/ko.ts 의 map.places 와 같다. 마커 접근성 이름과 시트 뱃지가 쓴다 */
export const PLACE_NAMES: Record<PlaceCode, string> = {
  BOOTH: '부스',
  PUB: '주점',
  FOODTRUCK: '푸드트럭',
  MEDI: '의무실',
  PHOTOBOOTH: '포토부스',
  TRASHCAN: '쓰레기통',
  ENTRANCE: '무대 출입구',
  BRACELET: '입장 팔찌',
  PROMOTION: '프로모션',
}

// 구역 번호를 쓰는 카테고리. 나머지는 category_sequence 가 그냥 표시 순서다
const SECTION_CODES: ReadonlySet<PlaceCode> = new Set(['BOOTH', 'PUB'])

// 백의 자리 → 구역 글자. 1 → A. 마커 글자와 구역 필터가 같은 글자를 쓰도록 여기서만 계산한다
function sectionLetter(sequence: number): string {
  return String.fromCharCode(64 + Math.floor(sequence / 100))
}

/**
 * 장소의 구역(A·B·C…). 구역 번호를 쓰는 카테고리이면서 100 이상일 때만 있다.
 * 100 미만(무대 출입구 11·12 등)은 구역 밖 예외 장소라 null
 */
export function placeSection(code: PlaceCode, sequence: number | null): string | null {
  return SECTION_CODES.has(code) && sequence !== null && sequence >= 100
    ? sectionLetter(sequence)
    : null
}

// 끝 두 자리가 이 값부터면 숫자 대신 소문자다. 51 → a
const LETTER_FROM = 51

/**
 * 마커 글자. category_sequence 백의 자리가 구역(1 → A), 나머지 두 자리가 번호라 101 은 A1, 251 은 Ba 다.
 * user 앱 features/map/map-place.ts 의 placeLabel 과 같은 규칙이다. 구역이 없는 카테고리나 번호가 아직 없으면 null
 */
export function placeLabel(code: PlaceCode, sequence: number | null): string | null {
  if (!SECTION_CODES.has(code) || sequence === null) return null
  // placeSection 을 쓰지 않는다. 100 미만도 지금껏 찍던 글자를 그대로 둔다
  const section = sectionLetter(sequence)
  const number = sequence % 100
  const suffix = number >= LETTER_FROM ? String.fromCharCode(97 + number - LETTER_FROM) : number
  return `${section}${suffix}`
}

/** 장소 편집의 "표시 순서" 아래 설명. 넣은 값이 마커에 어떻게 찍히는지 바로 보여 준다 */
export function sequenceHint(code: PlaceCode, sequence: number): string {
  if (!SECTION_CODES.has(code)) return '번호 대신 아이콘으로 표시'
  const rule = '101 → A1, 205 → B5, 251 → Ba'
  if (!Number.isInteger(sequence) || sequence < 1) return rule
  // 100 미만은 구역이 없고, 끝 두 자리가 00 이면 번호가 0 이라 마커 글자가 어긋난다
  if (sequence < 100 || sequence % 100 === 0) return `${rule} · ${sequence} 은 쓸 수 없는 번호`
  return `${rule} · 지금 ${sequence} → ${placeLabel(code, sequence)}`
}
