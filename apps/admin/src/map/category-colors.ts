import type { CategoryCode } from '../mocks/types'

/**
 * 지도 마커의 카테고리 색. Leaflet path 는 CSS 변수를 못 읽어 실제 값을 쓴다.
 * 외대 상징색(constants/brand-colors.ts)에서 골랐고, 의무실만 응급 관례에 따라 빨강이다.
 */
export const CATEGORY_COLORS: Record<CategoryCode, string> = {
  PUB: '#002D56', // HUFS NAVY
  BOOTH: '#146E7A', // HUFS GREEN
  FOODTRUCK: '#8D7150', // HUFS GOLD
  MEDI: '#C93A3A',
  BRACELET: '#9D9FA2', // HUFS SILVER
}
