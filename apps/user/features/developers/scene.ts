/** 카드 폭 264 와 사이 22 를 더한 한 칸 */
export const CARD_STEP = 286

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
