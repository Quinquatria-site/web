'use client'

import { motion, useReducedMotion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'

const STAGGER = 0.12

/** 크레딧 묶음이 60% 보이면 안의 줄들을 위에서부터 0.12초 간격으로 한 번 띄운다 */
export function CreditReveal({ className, children }: { className: string; children: ReactNode }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.6 }}
      transition={{ staggerChildren: STAGGER }}
    >
      {children}
    </motion.div>
  )
}

/** 크레딧의 한 줄. 아래 16px 에서 제자리로 오며 나타난다 */
export function CreditRevealItem({ children }: { children: ReactNode }) {
  // 움직임 줄이기를 켠 사람에게는 자리 이동 없이 투명도만 바꾼다
  const reduce = useReducedMotion()
  const variants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  }
  return <motion.div variants={variants}>{children}</motion.div>
}
