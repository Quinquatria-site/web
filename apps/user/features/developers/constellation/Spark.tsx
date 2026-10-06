'use client'

import { motion } from 'motion/react'

/** 별 점 하나. 켜질 때 고리가 퍼지고, 카드로 넘어가면 별빛이 되어 자기 카드가 설 가운데 자리로 날아가 사라진다 */
export function Spark({
  at,
  dx,
  dy,
  entered,
  reduce,
}: {
  at: number
  dx: number
  dy: number
  entered: boolean
  reduce: boolean
}) {
  return (
    <div
      style={{
        transform: entered && !reduce ? `translate(${dx}px, ${dy}px)` : undefined,
        opacity: entered ? 0 : 1,
        // 날아가는 동안은 보이다가 카드가 나타날 즈음 꺼진다
        transition: reduce
          ? 'none'
          : 'transform 0.9s cubic-bezier(.22,1,.36,1), opacity 0.3s ease-out 0.6s',
      }}
    >
      <motion.span
        className="absolute -top-2.5 -left-2.5 size-5 rounded-full border border-(--beige-yellow)"
        initial={{ opacity: 0 }}
        animate={reduce ? undefined : { opacity: [0.9, 0], scale: [1, 3.2] }}
        transition={{ delay: at, duration: 1 }}
      />
      <motion.span
        className="absolute -top-[5px] -left-[5px] size-2.5 rounded-full bg-(--beige-yellow) shadow-[0_0_10px_3px_rgb(249_163_66/0.8),0_0_30px_8px_rgb(249_163_66/0.35)]"
        initial={{ scale: reduce ? 1 : 0 }}
        animate={{ scale: 1 }}
        transition={
          reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 12, delay: at }
        }
      />
    </div>
  )
}
