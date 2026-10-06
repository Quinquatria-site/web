'use client'

import { useReducedMotion, useTransform } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { cinzel } from '@/shared/fonts'
import { paperlogy } from '@/shared/fonts/paperlogy'
import { BackText } from './backdrop/BackText'
import { ProgressBar } from './backdrop/ProgressBar'
import { CardTrack } from './card/CardTrack'
import { Constellation } from './constellation/Constellation'
import type { Member } from './members'
import { CARD_STEP, scrollScreens } from './scene'
import { useShowProgress } from './useShowProgress'
import { useStageSize } from './useStageSize'

/** 별자리 인트로 뒤 가로 카드로 이어지는 개발진 소개. 감싼 높이만큼 스크롤하는 동안 화면은 고정된다 */
export function DevelopersShow({
  title,
  organization,
  members,
  departments,
}: {
  title: ReactNode
  organization: string
  members: Member[]
  departments: Record<Member['id'], string>
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion() ?? false
  const count = members.length
  const span = CARD_STEP * (count - 1)

  const size = useStageSize(stageRef)
  const { enter, cards, introGone, reached } = useShowProgress(wrapRef, pinRef, count)
  const backOpacity = useTransform(enter, (e) => (e - 0.6) / 0.4)

  return (
    <div
      ref={wrapRef}
      className={`${cinzel.variable} ${paperlogy.variable} relative text-text-inverse`}
      style={{ height: `${(1 + scrollScreens(count)) * 100}svh` }}
    >
      <div ref={pinRef} className="sticky top-0 h-svh overflow-hidden">
        {title}
        <div ref={stageRef} className="absolute inset-x-0 top-(--page-title-height) bottom-0">
          <Constellation
            names={members.map((member) => member.name)}
            positions={members.map((member) => member.position)}
            organization={organization}
            size={size}
            enter={enter}
            still={introGone}
            reduce={reduce}
          />
          <BackText cards={cards} opacity={backOpacity} />
          <CardTrack
            members={members}
            departments={departments}
            enter={enter}
            cards={cards}
            span={span}
            reached={reached}
            reduce={reduce}
          />
          <ProgressBar cards={cards} opacity={backOpacity} />
        </div>
      </div>
    </div>
  )
}
