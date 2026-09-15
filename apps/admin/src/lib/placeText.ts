import { categoryById } from '../mocks/categories'
import { findTranslation, type Place } from '../mocks/types'

/**
 * ISO datetime 에서 HH:mm 만 뽑는다. 운영 시간 표시용.
 * offset 을 보지 않으므로 값이 KST(+09:00)라고 가정한다 (#10 에서 확인할 것).
 */
export function hhmm(iso: string): string {
  return iso.slice(11, 16)
}

/**
 * "주점 1번 · 17:00~23:00 · 서양어대학".
 * 목록 항목과 지도 시트가 같은 장소를 같은 문구로 말하도록 한곳에 둔다.
 */
export function detailOf(place: Place): string {
  const category = categoryById(place.category_id)
  const label = category ? findTranslation(category.translations, 'KO')?.name : ''
  const college = findTranslation(place.translations, 'KO')?.host_college
  return [
    `${label} ${place.category_sequence}번`,
    `${hhmm(place.start_hour)}~${hhmm(place.end_hour)}`,
    college,
  ]
    .filter(Boolean)
    .join(' · ')
}
