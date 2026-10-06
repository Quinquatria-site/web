'use client'

import { NODES } from '../scene'
import { ConstellationHeader } from './ConstellationHeader'
import { ConstellationLines } from './ConstellationLines'
import { StarNode } from './StarNode'

/** 들어오자마자 그려지는 별자리 인트로. 카드로 넘어가면 선·이름이 지워지고 점은 별빛이 되어 카드 자리로 날아간다 */
export function Constellation({
  names,
  positions,
  organization,
  size,
  entered,
  reduce,
}: {
  names: string[]
  positions: string[]
  organization: string
  size: { width: number; height: number }
  entered: boolean
  reduce: boolean
}) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <ConstellationHeader organization={organization} entered={entered} reduce={reduce} />
      <ConstellationLines size={size} entered={entered} reduce={reduce} />
      {NODES.map((node, i) => (
        <StarNode
          key={names[i]}
          index={i}
          node={node}
          name={names[i]}
          position={positions[i]}
          stageHeight={size.height}
          entered={entered}
          reduce={reduce}
        />
      ))}
    </div>
  )
}
