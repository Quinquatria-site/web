import { NODES } from '../scene'

// Made by → 단체명 → 점·선·이름을 차례로. 점 하나에 0.55초씩
const NODE_START = 1.6
const NODE_GAP = 0.55

/** i 번째 별 점이 켜지는 초 */
export const nodeAt = (i: number) => NODE_START + i * NODE_GAP

/** 마지막 이름까지 그려진 뒤 스크롤 안내가 뜨는 초 */
export const CUE_AT = nodeAt(NODES.length) + 1.2

/** 인트로 한 번 재생의 기본 transition. 움직임 줄이기를 켜면 흐림·튕김 없이 바로 보이게 한다 */
export const introTransition = (reduce: boolean, delay: number) =>
  reduce ? { duration: 0 } : { delay, duration: 0.8 }
