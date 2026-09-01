/**
 * 관리자 화면이 다루는 데이터 모양.
 * Django API 스펙이 아직 없어 이 파일이 임시 계약서 역할을 한다.
 * 스펙 요청서를 쓸 때 그대로 넘긴다.
 */

/** 이름과 가격 한 쌍. 유료 체험 항목과 주점·푸드트럭 메뉴에 함께 쓴다 */
export interface PricedItem {
  id: string
  name: string
  price: number
}

/** 부스. 이번 축제는 동아리 부스 없이 학생회·단과대 부스만 */
export interface Booth {
  id: string
  name: string
  /** 주최 단과대 */
  college: string
  /** 지도상 위치 번호 */
  spotNumber: number
  opensAt: string
  closesAt: string
  /** 마감 여부. 축제 당일 현장에서 가장 자주 바뀐다 */
  closed: boolean
  /** 체험할 수 있는 것들 */
  content: string
  /** 유료 체험 */
  priced: PricedItem[]
}

export interface Bar {
  id: string
  name: string
  college: string
  spotNumber: number
  opensAt: string
  closesAt: string
  closed: boolean
  menu: PricedItem[]
}

export interface FoodTruck {
  id: string
  name: string
  spotNumber: number
  opensAt: string
  closesAt: string
  closed: boolean
  menu: PricedItem[]
}

export type PerformanceKind = 'celebrity' | 'student'

export interface Performance {
  id: string
  kind: PerformanceKind
  /** 출연자명 */
  artist: string
  startsAt: string
  endsAt: string
  stage: string
}

export interface Notice {
  id: string
  title: string
  body: string
  /** 사용자 화면에 팝업으로 띄울지 */
  urgent: boolean
  published: boolean
  createdAt: string
}

export interface LostItem {
  id: string
  name: string
  foundPlace: string
  foundAt: string
  /** 주인에게 돌아갔는지 */
  returned: boolean
}

export type MapPinKind = 'booth' | 'bar' | 'truck' | 'trash' | 'medical'

export interface MapPin {
  id: string
  kind: MapPinKind
  label: string
  spotNumber?: number
  /** 배경 이미지 기준 백분율 좌표 */
  x: number
  y: number
}

export interface FestivalInfo {
  name: string
  concept: string
  theme: string
  startsOn: string
  endsOn: string
}
