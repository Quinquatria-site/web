import type { Point } from './campus'

/** 지도 위 이름표 한 개. 좌표는 글자 가운데, tone 은 건물 지붕 위(light)인지 땅 위(dark)인지 */
export interface CampusLabel extends Point {
  text: string
  tone: 'light' | 'dark'
  rotate?: number
}

/**
 * 캠퍼스 이름표. user 앱 features/map/map-labels.ts 의 좌표와 messages/ko.ts 의 map.labels 를
 * 합친 것이다. admin 은 다국어가 없어 한국어 이름을 바로 둔다. 좌표는 두 앱이 같아야 한다.
 */
export const CAMPUS_LABELS: CampusLabel[] = [
  { text: '국제학사', x: 408, y: 1045, tone: 'light' },
  { text: '사회\n과학관', x: 184, y: 854, tone: 'light' },
  { text: '도서관', x: 167, y: 574, tone: 'light' },
  { text: '교수회관', x: 204, y: 294, tone: 'light', rotate: 21.47 },
  { text: '사이버관', x: 400, y: 237, tone: 'light', rotate: 20.08 },
  { text: '법학관', x: 544, y: 934, tone: 'light' },
  { text: '본관', x: 767, y: 829, tone: 'light' },
  { text: '역사관', x: 855, y: 688, tone: 'light' },
  { text: '잔디광장', x: 395, y: 622, tone: 'dark' },
  { text: '미네르바\n컴플렉스', x: 824, y: 599, tone: 'dark' },
  { text: '미네르바\n공원', x: 953, y: 482, tone: 'dark' },
  { text: '운동장', x: 833, y: 311, tone: 'dark', rotate: 18.96 },
  { text: '붉은광장', x: 549, y: 500, tone: 'dark' },
  { text: '인문과학관', x: 1073, y: 1025, tone: 'light' },
  { text: '교수학습\n개발원', x: 1277, y: 855, tone: 'light' },
  { text: '외국어\n연수\n평가원', x: 1282, y: 615, tone: 'light' },
  { text: '국제관', x: 1125, y: 347, tone: 'light', rotate: 17.92 },
  { text: '대학원', x: 1069, y: 161, tone: 'light', rotate: 18.62 },
]
