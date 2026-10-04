import { getMessages } from '@/shared/i18n/messages'
import type { Locale } from '@/shared/i18n/locales'
import { taggedTitle } from '@/shared/metadata/share-metadata'
import type { MapPlace } from './map-place'

/** 장소 공유 카드 제목. `[종류] 이름` 꼴이다 */
export function placeShareTitle(locale: Locale, place: Pick<MapPlace, 'name' | 'code'>) {
  const { map, meta, pages } = getMessages(locale)
  const category = map.places[place.code]
  // 이름이 빈 서버 장소도 주소만 덩그러니 뜨지 않게 지도 페이지 이름으로 채운다
  const name = place.name || meta.pageTitle.replace('{page}', pages.map)
  // 이름이 이미 종류를 담으면(의무실처럼) 머리말이 같은 말을 되풀이한다
  return name.includes(category) ? name : taggedTitle(locale, category, name)
}
