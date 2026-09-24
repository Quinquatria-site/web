/** 장소(주점·부스·푸드트럭 등)의 언어 무관 필드 */
export interface PlaceBase {
  id: number
  category_id: number
  /** 카테고리 안 표시 순서 */
  category_sequence: number
  /** 배치 도면 좌표 */
  x: number
  y: number
  /** 운영 시작 시각. UTC offset 포함 ISO 8601 */
  start_hour: string
  /** 운영 종료 시각. UTC offset 포함 ISO 8601 */
  end_hour: string
  /** 순서 있는 이미지 key 목록. 없으면 null */
  place_image_uri: string[] | null
}

/** 장소의 번역 필드 */
export interface PlaceText {
  name: string
  host_college: string
  description: string
}
