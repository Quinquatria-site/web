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
  /** 아이콘 S3 key. 없으면 null (§5.3) */
  category_icon_uri: string | null
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
  /** 순서가 보존되는 이미지 목록. 없으면 null — 빈 배열은 422 다 (§5.4) */
  place_image_uri: string[] | null
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
  /** 메뉴 이미지 S3 key. 없으면 null (§5.5) */
  image_url: string | null
  /** 원 단위 0 이상 정수 (§2.2) */
  price: number
  translations: MenuTranslation[]
}

export const PERFORMANCE_TYPES = ['ARTIST', 'STUDENT', 'SPECIAL'] as const
export type PerformanceType = (typeof PERFORMANCE_TYPES)[number]

/**
 * 축제 일차. PERFORMANCE.date 는 자유 입력이 아니라 이 중 하나를 고르는 것이다.
 * 명세는 YYYY-MM-DD 형식만 규정하지만(§5.6), 이틀짜리 축제라 화면에서는
 * 날짜 입력칸 대신 일차 선택으로 받는다.
 *
 * 축제는 **10/6(화)~10/7(수)** 로 확정됐다. 장소 목의 운영 시간도 10/6 기준이다.
 *
 * 문서는 아직 안 따라왔다 — PRD §0 은 "10/6~8 중 이틀 (화·수·목)" 이고 부록 A-6 은
 * "어느 이틀인지 미정", v0.4 §9 블로커의 "공연 라인업의 축제 일차 배정" 도 비어
 * 있다. 문서를 고칠 때 이 값이 기준이다.
 *
 * 일정이 또 바뀌면 여기만 고치면 된다. API 는 임의의 YYYY-MM-DD 를 받으므로
 * 계약은 그대로고, 화면은 이 배열의 길이와 순서만 본다.
 */
export const FESTIVAL_DATES = ['2026-10-06', '2026-10-07'] as const
export type FestivalDate = (typeof FESTIVAL_DATES)[number]

/** "2026-10-06" → "10/6". 장소의 운영 일자처럼 날짜만 필요한 자리 */
export function festivalDateLabel(date: string): string {
  return `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`
}

/**
 * "2026-10-06" → "1일차 (10/6)".
 *
 * PRD §5-2 는 공연 타임라인을 일차로 묶는다고 하고 운영자는 날짜로 생각한다.
 * 둘 다 보여준다. 장소의 "운영 일자" 는 날짜만 쓰므로 festivalDateLabel 이다.
 */
export function festivalDayLabel(date: string): string {
  const index = FESTIVAL_DATES.indexOf(date as FestivalDate)
  return index < 0 ? date : `${index + 1}일차 (${festivalDateLabel(date)})`
}

export interface PerformanceTranslation {
  id: number
  performance_id: number
  language_code: LanguageCode
  title: string
  /** 공연 설명. 선택이며 생략하면 빈 문자열로 저장된다 (§5.2) */
  description: string
}

/**
 * 공연 (§5.6). 시작·종료 시각이 없다 — 축제 일정 지연이 잦아 시각 기반
 * "현재 공연" 판별이 잘 깨지기 때문이다. 대신 일차(date) 안의 순서(seq)로
 * 타임라인을 만들고, 현재 공연은 운영자가 올리는 is_live 로만 판단한다.
 *
 * seq 와 is_live 는 POST·PATCH 본문에 넣으면 422 다. 서버가 정하거나
 * 전용 엔드포인트로만 바뀐다 — 화면에 입력칸을 만들지 않는다.
 */
export interface Performance {
  id: number
  type: PerformanceType
  /** 이미지 S3 key. 업로드 플로우(#14) 전까지는 목 문자열이거나 null */
  image_uri: string | null
  /** 공연이 열리는 축제 일차. YYYY-MM-DD */
  date: string
  /** 같은 일차 안의 노출 순서. 서버가 1부터 빈틈 없이 매긴다 */
  seq: number
  /** 현재 공연 중 여부. 전체에서 최대 1건 */
  is_live: boolean
  translations: PerformanceTranslation[]
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
