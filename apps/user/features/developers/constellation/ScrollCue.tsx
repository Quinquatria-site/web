'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'
import { NODES } from '../scene'
import { CUE_AT } from './timing'

/** 별자리를 다 그린 뒤 뜨는 "SCROLL ↓". 스크롤을 시작하면 바로 사라진다 */
export function ScrollCue({ enter, reduce }: { enter: MotionValue<number>; reduce: boolean }) {
  const opacity = useTransform(enter, (e) => 1 - e * 20)

  return (
    <motion.p
      className="absolute inset-x-0 text-center font-cinzel text-[11px] tracking-[0.3em]"
      // 바닥이 아닌 마지막 별 아래에 붙여 폰 높이가 달라도 이름과의 간격이 같다
      style={{ top: `calc(${NODES[NODES.length - 1].y * 100}% + 56px)`, opacity }}
    >
      <motion.span
        className="inline-block"
        initial={{ opacity: 0 }}
        animate={reduce ? { opacity: 0.7 } : { opacity: 0.7, y: [0, 6, 0] }}
        transition={{
          opacity: { delay: reduce ? 0 : CUE_AT, duration: 0.6 },
          y: { delay: CUE_AT, duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        SCROLL ↓
      </motion.span>
    </motion.p>
  )
}
