/**
 * API 명세 §5 Backoffice 스키마를 그대로 옮긴 타입.
 *
 * 필드는 명세와 같은 snake_case 다. 임의로 camelCase 로 바꾸지 않는다 —
 * 이 타입이 곧 응답 형태라서, 나중에 실제 API(#10)가 붙을 때 화면 코드를
 * 다시 짜지 않아도 된다.
 *
 * enum 값은 backend packages/common/enums.py 와 글자까지 같다.
 * datetime 은 UTC offset 이 포함된 ISO 8601 문자열이다 (§2.2).
 */

export const LANGUAGE_CODES = ['KO', 'EN', 'CHN'] as const
export type LanguageCode = (typeof LANGUAGE_CODES)[number]

export const CATEGORY_CODES = ['PUB', 'BOOTH', 'FOODTRUCK', 'MEDI', 'BRACELET'] as const
export type CategoryCode = (typeof CATEGORY_CODES)[number]

/** 모든 목록 API 의 응답 컨테이너 (§2.5) */
export interface Page<T> {
  items: T[]
  page: number
  size: number
  total: number
}

export interface CategoryTranslation {
  id: number
  category_id: number
  language_code: LanguageCode
  name: string
}

export interface Category {
  id: number
  code: CategoryCode
  category_icon_uri: string
  translations: CategoryTranslation[]
}

export interface PlaceTranslation {
  id: number
  place_id: number
  language_code: LanguageCode
  name: string
  host_college: string
  description: string
}

export interface Place {
  id: number
  category_id: number
  /** 카테고리 안 표시 순서. 1 이상 (§5.4) */
  category_sequence: number
  /** 배치 도면(390×329, 좌상단 원점) 좌표. user 앱 목과 같은 좌표계다 (§8) */
  x: number
  y: number
  start_hour: string
  end_hour: string
  place_image_uri: string[]
  translations: PlaceTranslation[]
}

export interface MenuTranslation {
  id: number
  menu_id: number
  language_code: LanguageCode
  name: string
  description: string
}

export interface Menu {
  id: number
  place_id: number
  image_url: string
  /** 원 단위 0 이상 정수 (§2.2) */
  price: number
  translations: MenuTranslation[]
}

/** 번역 배열에서 특정 언어를 찾는다. Backoffice 응답은 language_code ASC 정렬(§5.1) */
export function findTranslation<T extends { language_code: LanguageCode }>(
  translations: T[],
  language: LanguageCode,
): T | undefined {
  return translations.find((t) => t.language_code === language)
}

/** 빠진 번역 언어 목록. Customer API 는 없는 언어의 항목을 목록에서 빼므로(§2.4) 경고에 쓴다 */
export function missingLanguages(translations: { language_code: LanguageCode }[]): LanguageCode[] {
  return LANGUAGE_CODES.filter((code) => !translations.some((t) => t.language_code === code))
}
