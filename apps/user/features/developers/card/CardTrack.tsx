'use client'

import { useState, type Ref } from 'react'
import type { Member } from '../members'
import { CARD_STEP } from '../scene'
import { DeveloperCard } from './DeveloperCard'

/** 무대 가운데의 카드 줄. 브라우저 가로 스크롤로 밀고 한 장씩 가운데에 멈춘다 */
export function CardTrack({
  ref,
  members,
  departments,
  entered,
  reduce,
}: {
  /** 진행 막대·뒤 글자가 이 줄의 스크롤을 따라간다 */
  ref: Ref<HTMLUListElement>
  members: Member[]
  departments: Record<Member['id'], string>
  entered: boolean
  reduce: boolean
}) {
  // 가운데 선 카드와, 가운데 온 적 있는 가장 먼 카드. 경계를 넘을 때만 바뀌어 스크롤 중 다시 그리지 않는다
  const [active, setActive] = useState(0)
  const [reached, setReached] = useState(0)

  return (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
      <ul
        ref={ref}
        // 별자리를 그리는 동안은 보이지 않는 카드의 링크로 포커스가 가지 않게 막는다
        inert={!entered}
        onScroll={(event) => {
          const next = Math.round(event.currentTarget.scrollLeft / CARD_STEP)
          setActive(next)
          setReached((prev) => Math.max(prev, next))
        }}
        // 위아래 여백은 카드 그림자가 스크롤 칸에 잘리지 않게 둔다
        className="flex snap-x snap-mandatory gap-[22px] overflow-x-auto overscroll-x-contain px-[calc(50%-132px)] py-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {members.map((member, i) => (
          <DeveloperCard
            key={member.id}
            index={i}
            member={member}
            department={departments[member.id]}
            entered={entered}
            active={active}
            revealed={entered && i <= reached}
            reduce={reduce}
          />
        ))}
      </ul>
    </div>
  )
}
