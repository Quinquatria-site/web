'use client'

import { motion } from 'motion/react'
import { CARD_STEP, type StarPoint } from '../scene'
import { Spark } from './Spark'
import { StarLabel } from './StarLabel'
import { nodeAt } from './timing'

/** 별자리의 별 하나. 점과 이름을 함께 둥실 띄우고, 카드로 넘어가면 점을 index 번째 카드 자리로 날려 보낸다 */
export function StarNode({
  index,
  node,
  name,
  position,
  stageHeight,
  entered,
  reduce,
}: {
  index: number
  node: StarPoint
  name: string
  position: string
  stageHeight: number
  entered: boolean
  reduce: boolean
}) {
  const at = nodeAt(index)

  return (
    <motion.div
      className="absolute"
      style={{ left: `calc(50% + ${node.x}px)`, top: `${node.y * 100}%` }}
      // 카드로 넘어가면 안 보이는 둥실 반복을 멈춰 JS 가 매 프레임 돌지 않게 한다
      animate={reduce || entered ? { y: 0 } : { y: [0, -6, 0] }}
      transition={{ delay: at + 1, duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Spark
        at={at}
        // 카드 줄은 첫 장이 가운데라 index 번째 카드 가운데는 무대 가운데에서 index 칸 옆이다
        dx={index * CARD_STEP - node.x}
        dy={(0.5 - node.y) * stageHeight}
        entered={entered}
        reduce={reduce}
      />
      <StarLabel
        name={name}
        position={position}
        side={node.side}
        at={at}
        entered={entered}
        reduce={reduce}
      />
    </motion.div>
  )
}
