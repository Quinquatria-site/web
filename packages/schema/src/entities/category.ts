/** 장소 카테고리 종류 */
export const CATEGORY_CODES = ['PUB', 'BOOTH', 'FOODTRUCK', 'MEDI', 'BRACELET'] as const
export type CategoryCode = (typeof CATEGORY_CODES)[number]

/** 카테고리의 언어 무관 필드 */
export interface CategoryBase {
  id: number
  code: CategoryCode
  /** 아이콘 이미지 key. 없으면 null */
  category_icon_uri: string | null
}

/** 카테고리의 번역 필드 */
export interface CategoryText {
  name: string
}
