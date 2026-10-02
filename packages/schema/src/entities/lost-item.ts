/** 분실물의 언어 무관 필드 */
export interface LostItemBase {
  id: number
  /** 분실물 이미지 key. 없으면 null */
  image_url: string | null
  /** 주인에게 돌려줬는지 */
  is_returned: boolean
  /** 등록 시각. UTC offset 포함 ISO 8601 */
  created_at: string
}

/** 분실물의 번역 필드 */
export interface LostItemText {
  title: string
  description: string
  /** 습득 장소. 자유 입력이라 번역 대상 */
  found_location: string
}
