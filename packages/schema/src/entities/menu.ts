/** 장소에 딸린 메뉴의 언어 무관 필드 */
export interface MenuBase {
  id: number
  place_id: number
  /** 메뉴 이미지 key. 없으면 null */
  image_url: string | null
  /** 원 단위, 0 이상 정수 */
  price: number
}

/** 메뉴의 번역 필드 */
export interface MenuText {
  name: string
  description: string
}
