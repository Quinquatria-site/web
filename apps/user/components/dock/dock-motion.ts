import type { Transition } from 'motion/react'
import { DOCK_TABS } from './dock-mode'

/** 도크 폭이 벌어지고 좁아지는 스프링. 탭 펼침과 선택 표시 이동이 같이 쓴다 */
export const DOCK_SPRING = { type: 'spring', stiffness: 500, damping: 38 } satisfies Transition

/** 원이 뿅 하고 나타나고 사라지는 스프링 */
export const DOCK_POP = {
  type: 'spring',
  stiffness: 700,
  damping: 26,
  mass: 0.6,
} satisfies Transition

/** 탭 하나가 앞 탭보다 늦게 움직이는 간격(초) */
export const TAB_STAGGER = 0.03

/** 탭 하나가 접히는 데 걸리는 시간(초) */
export const TAB_COLLAPSE = 0.16

/** 탭바가 원으로 다 접히기까지 걸리는 시간(초). 홈으로 갈 때 이만큼 기다렸다 사라진다 */
export const BAR_COLLAPSE = TAB_COLLAPSE + TAB_STAGGER * (DOCK_TABS.length - 1)
