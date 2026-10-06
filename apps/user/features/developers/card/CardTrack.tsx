'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'
import type { Member } from '../members'
import { DeveloperCard } from './DeveloperCard'

/** 무대 가운데를 가로지르는 카드 줄. 첫 카드를 가운데 두고 넘김 진행만큼 왼쪽으로 민다 */
export function CardTrack({
  members,
  departments,
  enter,
  cards,
  span,
  reached,
  reduce,
}: {
  members: Member[]
  departments: Record<Member['id'], string>
  enter: MotionValue<number>
  cards: MotionValue<number>
  span: number
  reached: number
  reduce: boolean
}) {
  const x = useTransform(cards, (c) => -c * span)

  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[410px] -translate-y-1/2">
      <motion.ul
        className="flex gap-[22px] pl-[calc(50%-132px)] will-change-transform"
        style={{ x }}
      >
        {members.map((member, i) => (
          <DeveloperCard
            key={member.id}
            index={i}
            member={member}
            department={departments[member.id]}
            enter={enter}
            cards={cards}
            span={span}
            revealed={i <= reached}
            reduce={reduce}
          />
        ))}
      </motion.ul>
    </div>
  )
}
