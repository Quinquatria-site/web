import type { Variants } from 'motion/react'

/** 이름 글자 하나가 기울어진 채 아래에서 튀어 오른다 */
export const pop = (reduce: boolean): Variants => ({
  hidden: { opacity: 0, y: reduce ? 0 : 30, rotate: reduce ? 0 : 12 },
  shown: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { type: 'spring', stiffness: 380, damping: 18 },
  },
})

/** 학과·링크 줄이 작게 있다가 튕기며 커진다 */
export const fade = (reduce: boolean): Variants => ({
  hidden: { opacity: 0, y: reduce ? 0 : 10, scale: reduce ? 1 : 0.4 },
  shown: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 500, damping: 15 },
  },
})
