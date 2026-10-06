'use client'

import { motion, type MotionValue } from 'motion/react'
import { NODES } from '../scene'
import { nodeAt } from './timing'

/** 별 점을 차례로 잇는 선. 다음 점이 켜지기 직전에 그 점까지 선이 자란다 */
export function ConstellationLines({
  size,
  opacity,
  reduce,
}: {
  size: { width: number; height: number }
  opacity: MotionValue<number>
  reduce: boolean
}) {
  if (size.width === 0) return null
  const points = NODES.map((node) => [size.width / 2 + node.x, node.y * size.height])

  return (
    <motion.svg
      className="absolute inset-0 size-full overflow-visible"
      viewBox={`0 0 ${size.width} ${size.height}`}
      style={{ opacity }}
    >
      {points.slice(1).map(([x, y], i) => (
        <motion.path
          key={i}
          d={`M${points[i][0]} ${points[i][1]} L${x} ${y}`}
          fill="none"
          stroke="rgb(253 235 184 / 0.55)"
          strokeWidth={1}
          initial={{ pathLength: reduce ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={reduce ? { duration: 0 } : { delay: nodeAt(i + 1) - 0.4, duration: 0.45 }}
        />
      ))}
    </motion.svg>
  )
}
