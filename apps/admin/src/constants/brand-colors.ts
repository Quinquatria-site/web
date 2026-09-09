/**
 * 한국외대 공식 상징색.
 *
 * 학교가 고지한 Pantone 과 RGB 를 그대로 옮겼다. hex 는 그 RGB 를 환산한 값이고,
 * 별색을 화면용으로 다시 계산하지는 않았다. CMYK 는 인쇄용이라 옮기지 않았다.
 *
 * 화면에서 이 값을 직접 부르지 않는다. SEED 토큰을 덮는 재료로만 쓴다.
 * 컴포넌트는 `--seed-color-*` 역할 토큰을 통해 색을 받는다.
 */

/**
 * Primary.
 *
 * 둘 중 유채색은 green 하나뿐이다. gray 는 중립색이라 SEED 의 brand 역할이 아니라
 * neutral 쪽에 해당한다.
 */
export const HUFS_PRIMARY = {
  /** PANTONE 315C · RGB 20, 110, 122 */
  green: '#146E7A',
  /** PANTONE COOL GRAY 5C · RGB 218, 218, 211 */
  gray: '#DADAD3',
} as const

/** Secondary. 강조와 보조에 쓴다. */
export const HUFS_SECONDARY = {
  /** PANTONE 7463C · RGB 0, 45, 86 */
  navy: '#002D56',
  /** PANTONE 874C · RGB 141, 113, 80 */
  gold: '#8D7150',
  /** PANTONE 877C · RGB 157, 159, 162 */
  silver: '#9D9FA2',
} as const

export const HUFS_COLORS = { ...HUFS_PRIMARY, ...HUFS_SECONDARY } as const

export type HufsColorName = keyof typeof HUFS_COLORS
