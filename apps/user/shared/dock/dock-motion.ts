import type { Transition } from 'motion/react'
import { DOCK_TABS } from './dock-mode'

/** 펼침·접힘 빠르기 배율. 1 보다 작으면 느려지고, 아래 펼침·접힘 값이 모두 이 비율을 따른다 */
const TEMPO = 0.8

// 시간 값은 배율로 나누면 같은 비율로 늘어난다
const seconds = (s: number) => s / TEMPO

/** 도크 폭이 벌어지고 좁아지는 스프링 */
export const DOCK_SPRING = {
  type: 'spring',
  // stiffness 는 배율의 제곱, damping 은 배율만큼 바꿔야 튀는 정도가 그대로 남는다
  stiffness: 500 * TEMPO ** 2,
  damping: 38 * TEMPO,
} satisfies Transition

/** 원이 뿅 하고 나타나고 사라지는 스프링 */
export const DOCK_POP = {
  type: 'spring',
  stiffness: 700,
  damping: 26,
  mass: 0.6,
} satisfies Transition

/** 누르는 동안 줄어드는 크기 */
export const PRESS_SCALE = 0.9

/** 누르는 동안 줄었다가 돌아오는 스프링. 펼침 시차가 섞이지 않게 따로 둔다 */
export const DOCK_PRESS = { type: 'spring', stiffness: 700, damping: 35 } satisfies Transition

/** 탭 하나가 앞 탭보다 늦게 움직이는 간격(초) */
export const TAB_STAGGER = seconds(0.03)

/** 탭 하나가 접히는 데 걸리는 시간(초) */
export const TAB_COLLAPSE = seconds(0.16)

/** 탭 하나가 폭 0 에서 다 벌어지기까지 걸리는 대략의 시간(초). 선택 표시가 그 뒤에 얹힌다 */
export const TAB_EXPAND = seconds(0.3)

/** 원 안 화살표가 탭에 깔리기 전에 사라지는 시간(초) */
export const ARROW_OUT = seconds(0.08)

/** 탭이 걷힌 뒤 원 안 화살표가 나타나는 시간과 기다림(초) */
export const ARROW_IN = { duration: seconds(0.15), delay: seconds(0.1) }

/** 탭바가 다 펼쳐진 뒤 선택 표시가 나타나는 시간(초) */
export const PILL_IN = seconds(0.18)

/** 탭바가 원으로 다 접히기까지 걸리는 시간(초). 홈으로 갈 때 이만큼 기다렸다 사라진다 */
export const BAR_COLLAPSE = TAB_COLLAPSE + TAB_STAGGER * (DOCK_TABS.length - 1)
