import type { Localized } from '@quen/schema/common/localize'
import type { CategoryCode } from '@quen/schema/entities/category'
import type { MenuBase, MenuText } from '@quen/schema/entities/menu'
import type { PlaceBase, PlaceText } from '@quen/schema/entities/place'

/** 서버 카테고리에 곧 붙을 포토부스·쓰레기통까지 더한 장소 종류. 두 이름은 서버 코드가 정해지면 맞춘다 */
export type PlaceCode = CategoryCode | 'PHOTO' | 'TRASH'

/** 장소에 딸린 메뉴 한 건 */
export type PlaceMenu = Localized<MenuBase, MenuText>

/** 지도에 찍을 장소 한 건. category_id 는 카테고리 코드로 풀고, 시트에 보일 메뉴를 붙여 둔다 */
export type MapPlace = Localized<PlaceBase, PlaceText> & { code: PlaceCode; menus: PlaceMenu[] }

// 구역 번호를 쓰는 카테고리. 나머지는 category_sequence 가 그냥 표시 순서다
const SECTION_CODES: ReadonlySet<PlaceCode> = new Set(['BOOTH', 'PUB'])

/** 마커 글자. category_sequence 백의 자리가 구역(1 → A), 나머지 두 자리가 번호라 101 은 A1 이다. 구역이 없는 카테고리는 null */
export function placeLabel({
  code,
  category_sequence,
}: Pick<MapPlace, 'code' | 'category_sequence'>): string | null {
  if (!SECTION_CODES.has(code)) return null
  const section = String.fromCharCode(64 + Math.floor(category_sequence / 100))
  return `${section}${category_sequence % 100}`
}
