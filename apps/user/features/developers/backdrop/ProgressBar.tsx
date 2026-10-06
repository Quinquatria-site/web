'use client'

import { motion, type MotionValue } from 'motion/react'

/** 카드 줄 아래 넘김 진행 막대. 마지막 카드에 닿으면 끝까지 찬다 */
export function ProgressBar({
  progress,
  shown,
}: {
  progress: MotionValue<number>
  shown: boolean
}) {
  return (
    <div
      aria-hidden
      className={`absolute inset-x-10 top-[calc(50%+235px)] h-0.5 bg-(--beige-yellow)/20 transition-opacity duration-700 ${shown ? '' : 'opacity-0'}`}
    >
      <motion.span
        className="absolute inset-0 origin-left bg-primary"
        style={{ scaleX: progress }}
      />
    </div>
  )
}
