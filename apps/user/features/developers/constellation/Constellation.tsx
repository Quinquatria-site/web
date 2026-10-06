'use client'

import { useTransform, type MotionValue } from 'motion/react'
import { NODES } from '../scene'
import { ConstellationHeader } from './ConstellationHeader'
import { ConstellationLines } from './ConstellationLines'
import { ScrollCue } from './ScrollCue'
import { StarNode } from './StarNode'

/** 들어오자마자 그려지는 별자리 인트로. 스크롤해 카드로 넘어가면 선·이름이 지워지고 점은 별빛이 되어 카드 자리로 날아간다 */
export function Constellation({
  names,
  positions,
  organization,
  size,
  enter,
  still,
  reduce,
}: {
  names: string[]
  positions: string[]
  organization: string
  size: { width: number; height: number }
  enter: MotionValue<number>
  still: boolean
  reduce: boolean
}) {
  const textOpacity = useTransform(enter, (e) => 1 - e * 2.5)

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <ConstellationHeader organization={organization} opacity={textOpacity} reduce={reduce} />
      <ConstellationLines size={size} opacity={textOpacity} reduce={reduce} />
      {NODES.map((node, i) => (
        <StarNode
          key={names[i]}
          index={i}
          node={node}
          name={names[i]}
          position={positions[i]}
          stageHeight={size.height}
          enter={enter}
          labelOpacity={textOpacity}
          still={still}
          reduce={reduce}
        />
      ))}
      <ScrollCue enter={enter} reduce={reduce} />
    </div>
  )
}
