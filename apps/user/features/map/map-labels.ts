import type { Messages } from '@/shared/i18n/messages'
import type { MapPoint } from './map-coords'

/** 지도 위 이름표 한 개. 좌표는 글자 가운데, tone 은 건물 지붕 위(light)인지 땅 위(dark)인지 */
export interface MapLabel extends MapPoint {
  key: keyof Messages['map']['labels']
  tone: 'light' | 'dark'
  rotate?: number
}

/** 캠퍼스 이름표. 피그마 지도(995:4864) 글자 상자 가운데를 이미지 픽셀로 옮긴 값 */
export const MAP_LABELS: MapLabel[] = [
  { key: 'globalDorm', x: 408, y: 1045, tone: 'light' },
  { key: 'socialScience', x: 184, y: 854, tone: 'light' },
  { key: 'library', x: 167, y: 574, tone: 'light' },
  { key: 'facultyHall', x: 204, y: 294, tone: 'light', rotate: 21.47 },
  { key: 'cyberHall', x: 400, y: 237, tone: 'light', rotate: 20.08 },
  { key: 'lawHall', x: 544, y: 934, tone: 'light' },
  { key: 'mainHall', x: 767, y: 829, tone: 'light' },
  { key: 'historyHall', x: 855, y: 688, tone: 'light' },
  { key: 'lawnPlaza', x: 395, y: 622, tone: 'dark' },
  { key: 'minervaComplex', x: 824, y: 599, tone: 'dark' },
  { key: 'minervaPark', x: 953, y: 482, tone: 'dark' },
  { key: 'field', x: 798, y: 323, tone: 'dark' },
  { key: 'stage', x: 948, y: 278, tone: 'dark' },
  { key: 'redSquare', x: 549, y: 500, tone: 'dark' },
  { key: 'humanities', x: 1073, y: 1025, tone: 'light' },
  { key: 'teachingCenter', x: 1277, y: 855, tone: 'light' },
  { key: 'languageCenter', x: 1282, y: 615, tone: 'light' },
  { key: 'internationalHall', x: 1125, y: 347, tone: 'light', rotate: 17.92 },
  { key: 'graduateSchool', x: 1069, y: 161, tone: 'light', rotate: 18.62 },
]
