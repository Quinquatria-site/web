/** 공연 종류 */
export const PERFORMANCE_TYPES = ['ARTIST', 'STUDENT', 'SPECIAL'] as const
export type PerformanceType = (typeof PERFORMANCE_TYPES)[number]

/** 공연의 언어 무관 필드 */
export interface PerformanceBase {
  id: number
  type: PerformanceType
  /** 공연 이미지 key. 없으면 null */
  image_uri: string | null
  /** 공연 일자. YYYY-MM-DD */
  date: string
  /** 같은 일자 안의 순서. 1부터 */
  seq: number
  /** 지금 공연 중인지. 전체에서 최대 1건 */
  is_live: boolean
}

/** 공연의 번역 필드 */
export interface PerformanceText {
  title: string
  description: string
}
