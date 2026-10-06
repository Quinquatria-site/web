'use client'

import { motion, type MotionValue } from 'motion/react'
import { CARD_STEP, type StarPoint } from '../scene'
import { Spark } from './Spark'
import { StarLabel } from './StarLabel'
import { nodeAt } from './timing'

/** 별자리의 별 하나. 점과 이름을 함께 둥실 띄우고, 점은 index 번째 카드 자리로 날려 보낸다 */
export function StarNode({
  index,
  node,
  name,
  position,
  stageHeight,
  enter,
  labelOpacity,
  still,
  reduce,
}: {
  index: number
  node: StarPoint
  name: string
  position: string
  stageHeight: number
  enter: MotionValue<number>
  labelOpacity: MotionValue<number>
  still: boolean
  reduce: boolean
}) {
  const at = nodeAt(index)

  return (
    <motion.div
      className="absolute"
      style={{ left: `calc(50% + ${node.x}px)`, top: `${node.y * 100}%` }}
      animate={reduce || still ? { y: 0 } : { y: [0, -6, 0] }}
      transition={{ delay: at + 1, duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Spark
        enter={enter}
        at={at}
        // 카드 줄은 첫 장이 가운데라 index 번째 카드 가운데는 무대 가운데에서 index 칸 옆이다
        dx={index * CARD_STEP - node.x}
        dy={(0.5 - node.y) * stageHeight}
        reduce={reduce}
      />
      <StarLabel
        name={name}
        position={position}
        side={node.side}
        at={at}
        opacity={labelOpacity}
        reduce={reduce}
      />
    </motion.div>
  )
}
