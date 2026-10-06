'use client'

import { useReducedMotion, useScroll } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cinzel } from '@/shared/fonts'
import { paperlogy } from '@/shared/fonts/paperlogy'
import { BackText } from './backdrop/BackText'
import { ProgressBar } from './backdrop/ProgressBar'
import { CardTrack } from './card/CardTrack'
import { Constellation } from './constellation/Constellation'
import { ENTER_AT } from './constellation/timing'
import type { Member } from './members'
import { useStageSize } from './useStageSize'

/** 별자리를 그린 뒤 별빛이 카드로 바뀌고, 그 자리에서 카드를 옆으로 밀어 넘기는 개발진 소개. 한 화면 안에서 끝난다 */
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
  const stageRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)
  const reduce = useReducedMotion() ?? false
  const size = useStageSize(stageRef)
  const { scrollXProgress } = useScroll({ container: trackRef })

  // 별자리를 다 그리면 별빛이 카드로 바뀐다. 기다리기 싫으면 무대를 눌러 바로 넘긴다
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), ENTER_AT * 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    // 세로로는 스크롤하지 않는 한 화면이라 main 의 도크 여백을 되돌려 페이지가 밀리지 않게 한다
    <div
      className={`${cinzel.variable} ${paperlogy.variable} relative -mb-(--dock-space) h-[calc(100svh-env(safe-area-inset-top))] overflow-hidden text-text-inverse`}
    >
      {title}
      <div
        ref={stageRef}
        onClick={() => setEntered(true)}
        className="absolute inset-x-0 top-(--page-title-height) bottom-0"
      >
        <Constellation
          names={members.map((member) => member.name)}
          positions={members.map((member) => member.position)}
          organization={organization}
          size={size}
          entered={entered}
          reduce={reduce}
        />
        <BackText progress={scrollXProgress} shown={entered} />
        <CardTrack
          ref={trackRef}
          members={members}
          departments={departments}
          entered={entered}
          reduce={reduce}
        />
        <ProgressBar progress={scrollXProgress} shown={entered} />
      </div>
    </div>
  )
}
