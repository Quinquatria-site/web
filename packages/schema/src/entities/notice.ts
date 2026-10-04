/** 공지 종류. PERMANENT 는 상단 고정, GENERAL 은 일반 */
export const NOTICE_TYPES = ['PERMANENT', 'GENERAL'] as const
export type NoticeType = (typeof NOTICE_TYPES)[number]

/** 공지의 언어 무관 필드 */
export interface NoticeBase {
  id: number
  type: NoticeType
  /** 등록 시각. UTC offset 포함 ISO 8601 */
  created_at: string
  /** 순서 있는 이미지 key 목록. 없으면 null */
  notice_image_uri: string[] | null
}

/** 공지의 번역 필드 */
export interface NoticeText {
  title: string
  content: string
}
