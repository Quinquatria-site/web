import type { Localized } from '@quen/schema/common/localize'
import type { CategoryCode } from '@quen/schema/entities/category'
import type { MenuBase, MenuText } from '@quen/schema/entities/menu'
import type { PlaceBase, PlaceText } from '@quen/schema/entities/place'
import { formatSeoulTime } from '@/shared/time/format-seoul-time'
import type { MapPoint } from './map-coords'

/** 서버 카테고리에 곧 붙을 포토부스·쓰레기통까지 더한 장소 종류. 두 이름은 서버 코드가 정해지면 맞춘다 */
export type PlaceCode = CategoryCode | 'PHOTO' | 'TRASH'

/** 장소에 딸린 메뉴 한 건 */
export type PlaceMenu = Localized<MenuBase, MenuText>

/** 장소 구분값이자 주소 칸(/map/12). 서버 장소는 숫자, 프론트에 둔 장소는 이름이다 */
export type PlaceId = number | string

/** 지도에 찍을 장소 한 건. category_id 는 카테고리 코드로 풀고, 시트에 보일 메뉴를 붙여 둔다 */
export type MapPlace = Omit<Localized<PlaceBase, PlaceText>, 'id'> & {
  id: PlaceId
  code: PlaceCode
  menus: PlaceMenu[]
  /** 점 대신 칠할 영역의 꼭짓점. 있으면 마커 대신 폴리곤으로 그린다 */
  area?: MapPoint[]
}

/** 주소 칸을 장소 id 로. 숫자만 있으면 서버 장소다 */
export function toPlaceId(segment: string): PlaceId {
  return /^\d+$/.test(segment) ? Number(segment) : segment
}

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

/** 운영 시간 `15:00 - 22:00`. 끝 시각이 없으면 `15:00 ~`, 시작도 없으면 null */
export function placeHours({
  start_hour,
  end_hour,
}: Pick<MapPlace, 'start_hour' | 'end_hour'>): string | null {
  if (!start_hour) return null
  const start = formatSeoulTime(start_hour)
  return end_hour ? `${start} - ${formatSeoulTime(end_hour)}` : `${start} ~`
}
