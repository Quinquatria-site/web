'use client'

import { motion } from 'motion/react'
import { fadeOut, introTransition } from './timing'

/** 별 점 옆 이름과 포지션. 점 반대쪽에서 흐림을 벗으며 다가온다 */
export function StarLabel({
  name,
  position,
  side,
  at,
  entered,
  reduce,
}: {
  name: string
  position: string
  side: 'left' | 'right'
  at: number
  entered: boolean
  reduce: boolean
}) {
  return (
    <div
      className={`absolute -top-3 font-cinzel text-[17px] tracking-[0.06em] whitespace-nowrap [text-shadow:0_0_12px_rgb(249_163_66/0.6)] ${side === 'right' ? 'left-4' : 'right-4 text-right'} ${fadeOut(entered)}`}
    >
      <motion.div
        initial={{
          opacity: 0,
          x: reduce ? 0 : side === 'right' ? -10 : 10,
          filter: reduce ? 'none' : 'blur(10px)',
        }}
        animate={{ opacity: 1, x: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
        transition={introTransition(reduce, at + 0.1)}
      >
        {name}
        <small className="block font-sans text-[11px] tracking-[0.08em] opacity-60 [text-shadow:none]">
          {position}
        </small>
      </motion.div>
    </div>
  )
}
