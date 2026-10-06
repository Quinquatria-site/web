'use client'

import { motion, type MotionValue } from 'motion/react'

/** 카드 줄 아래 넘김 진행 막대. 마지막 카드에 닿으면 끝까지 찬다 */
export function ProgressBar({
  cards,
  opacity,
}: {
  cards: MotionValue<number>
  opacity: MotionValue<number>
}) {
  return (
    <motion.div
      aria-hidden
      className="absolute inset-x-10 top-[calc(50%+235px)] h-0.5 bg-(--beige-yellow)/20"
      style={{ opacity }}
    >
      <motion.span className="absolute inset-0 origin-left bg-primary" style={{ scaleX: cards }} />
    </motion.div>
  )
}
