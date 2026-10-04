import type { Localized, MaybeLocalized } from '@quen/schema/common/localize'
import type { CategoryCode } from '@quen/schema/entities/category'
import type { MenuBase, MenuText } from '@quen/schema/entities/menu'
import type { PlaceBase, PlaceText } from '@quen/schema/entities/place'
import { formatSeoulTime } from '@/shared/time/format-seoul-time'
import type { MapPoint } from './map-coords'

/** 지도에 찍는 장소 종류. 서버 카테고리 코드와 같다 */
export type PlaceCode = CategoryCode

/** 장소에 딸린 메뉴 한 건 */
export type PlaceMenu = Localized<MenuBase, MenuText>

/** 장소 구분값이자 주소 칸(/map/12) */
export type PlaceId = number

/** 지도에 찍을 장소 한 건. category_id 는 카테고리 코드로 풀고, 시트에 보일 메뉴를 붙여 둔다. is_polygon 이면 마커 대신 area 로 폴리곤을 그리고, x · y 는 화면을 옮길 기준점이다 */
export type MapPlace = Omit<
  MaybeLocalized<PlaceBase, PlaceText>,
  'x' | 'y' | 'is_polygon' | 'area'
> &
  MapPoint & {
    code: PlaceCode
    menus: PlaceMenu[]
    /** 번역된 장소의 한국어 원문. 다른 언어 페이지에서도 한국어로 찾게 검색에만 쓰고, 원문을 그대로 보이는 장소면 null */
    source: Pick<MaybeLocalized<PlaceBase, PlaceText>, 'name' | 'host_college'> | null
  } & ({ is_polygon: true; area: MapPoint[] } | { is_polygon: false; area?: undefined })

/** 주소 칸을 장소 id 로. 숫자가 아니면 없는 장소라 null */
export function toPlaceId(segment: string): PlaceId | null {
  return /^\d+$/.test(segment) ? Number(segment) : null
}

// 구역 번호를 쓰는 카테고리. 나머지는 category_sequence 가 그냥 표시 순서다
const SECTION_CODES: ReadonlySet<PlaceCode> = new Set(['BOOTH', 'PUB'])

// 끝 두 자리가 이 값부터면 숫자 대신 소문자다. 51 → a
const LETTER_FROM = 51

/** 마커 글자. category_sequence 백의 자리가 구역(1 → A), 나머지 두 자리가 번호라 101 은 A1, 251 은 Ba 다. 구역이 없는 카테고리나 번호가 아직 없으면 null */
export function placeLabel({
  code,
  category_sequence,
}: Pick<MapPlace, 'code' | 'category_sequence'>): string | null {
  if (!SECTION_CODES.has(code) || category_sequence === null) return null
  const section = String.fromCharCode(64 + Math.floor(category_sequence / 100))
  const number = category_sequence % 100
  const suffix = number >= LETTER_FROM ? String.fromCharCode(97 + number - LETTER_FROM) : number
  return `${section}${suffix}`
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
