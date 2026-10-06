'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'
import { clamp01 } from '../scene'

/** 별 점 하나. 켜질 때 고리가 퍼지고, 스크롤하면 별빛이 되어 자기 카드가 설 가운데 자리로 날아가 사라진다 */
export function Spark({
  enter,
  at,
  dx,
  dy,
  reduce,
}: {
  enter: MotionValue<number>
  at: number
  dx: number
  dy: number
  reduce: boolean
}) {
  // 카드는 크기를 바꾸면 비싸서, 스크롤에 붙어 움직이는 건 이 작은 점뿐이다
  const flight = useTransform(enter, (e) => (reduce ? 0 : clamp01(e / 0.6)))
  const x = useTransform(flight, (f) => f * dx)
  const y = useTransform(flight, (f) => f * dy)
  const opacity = useTransform(enter, (e) =>
    reduce ? (e > 0.15 ? 0 : 1) : 1 - clamp01((e - 0.55) / 0.3),
  )

  return (
    <motion.div className="will-change-transform" style={{ x, y, opacity }}>
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
    </motion.div>
  )
}
