import type { CategoryCode } from '../mocks/types'

/**
 * 지도 마커의 카테고리 색. user 앱 styles/tokens 의 place 색(--color-place-*)과 같은 값이다.
 * 학생 지도와 같은 색이어야 운영자가 두 화면을 보며 같은 장소를 바로 맞춰 본다.
 */
export const CATEGORY_COLORS: Record<CategoryCode, string> = {
  BOOTH: '#b85b56', // twilight
  PUB: '#c37555', // brick
  FOODTRUCK: '#f9a342', // sunlight
  MEDI: '#e62526', // red
  BRACELET: '#f942cb', // magenta
}
