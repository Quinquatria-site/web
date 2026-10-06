/** 카드 폭 264 와 사이 22 를 더한 한 칸 */
export const CARD_STEP = 286

/** 별자리 인트로가 카드로 바뀌는 데 쓰는 스크롤 화면 수 */
const INTRO_SCREENS = 1

/** 카드 한 장을 옆으로 넘기는 데 쓰는 스크롤 화면 수 */
const CARD_SCREENS = 0.8

/** 별 점 자리. x 는 화면 가운데에서의 px, y 는 무대 높이 비율이라 폭·높이가 달라도 모양이 유지된다 */
export const NODES = [
  { x: -114, y: 0.32, side: 'right' },
  { x: 106, y: 0.43, side: 'left' },
  { x: -70, y: 0.54, side: 'right' },
  { x: 102, y: 0.65, side: 'left' },
  { x: -94, y: 0.76, side: 'right' },
] as const

/** 별 점 하나의 자리와 이름이 놓이는 쪽 */
export type StarPoint = (typeof NODES)[number]

/** 카드 수만큼 넘기는 구간까지 합친 스크롤 화면 수. 감싸는 높이는 여기에 고정되는 한 화면을 더한다 */
export function scrollScreens(count: number) {
  return INTRO_SCREENS + CARD_SCREENS * (count - 1)
}

/** 0~1 로 자른다 */
export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

// 처음과 끝을 천천히 지나 별에서 카드가 갑자기 튀어나오지 않게 한다
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

/** 전체 스크롤 진행을 별자리→카드 전환(enter)과 카드 넘김(cards) 두 구간의 0~1 로 나눈다 */
export function phases(progress: number, count: number) {
  const screens = progress * scrollScreens(count)
  return {
    enter: easeInOutCubic(clamp01(screens / INTRO_SCREENS)),
    cards: clamp01((screens - INTRO_SCREENS) / (CARD_SCREENS * (count - 1))),
  }
}
