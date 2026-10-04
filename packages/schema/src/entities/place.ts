/** 장소(주점·부스·푸드트럭 등)의 언어 무관 필드 */
export interface PlaceBase {
  id: number
  /** 아직 정하지 않았으면 null */
  category_id: number | null
  /** 카테고리 안 표시 순서. 아직 정하지 않았으면 null */
  category_sequence: number | null
  /** true 면 x · y 대신 area 가 위치인 구역 장소 */
  is_polygon: boolean
  /** 점 장소의 배치 도면 좌표. 구역 장소이거나 아직 정하지 않았으면 null */
  x: number | null
  y: number | null
  /** 구역 장소의 꼭짓점. 점 장소이거나 아직 정하지 않았으면 null */
  area: PlaceVertex[] | null
  /** 운영 시작 시각. UTC offset 포함 ISO 8601. 없으면 null */
  start_hour: string | null
  /** 운영 종료 시각. UTC offset 포함 ISO 8601. 없으면 null */
  end_hour: string | null
  /** 순서 있는 이미지 key 목록. 없으면 null */
  place_image_uri: string[] | null
}

/** 구역 장소 꼭짓점 하나의 배치 도면 좌표 */
export interface PlaceVertex {
  x: number
  y: number
}

/** 장소의 번역 필드 */
export interface PlaceText {
  name: string
  host_college: string
  description: string
}
