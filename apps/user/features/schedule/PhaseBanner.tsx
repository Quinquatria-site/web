'use client'

import { type ReactNode, useEffect, useId, useState } from 'react'
import { type FestivalPhase, currentTime, phaseAt, phaseScript } from './festival-phase'
import { InlineScript } from './InlineScript'

// 서버가 구울 때 기본값. JS 가 꺼져 있으면 이대로 보인다
const SERVER_PHASE: FestivalPhase = 'open'

// Tailwind 가 읽도록 시점별 클래스를 통째로 적는다
const SHOW_ON: Record<FestivalPhase, string> = {
  before: 'group-data-[phase=before]:block',
  open: 'group-data-[phase=open]:block',
  break: 'group-data-[phase=break]:block',
  after: 'group-data-[phase=after]:block',
}

/** 시점별 배너를 모두 구워 두고 지금 시점 것만 보인다. 첫 그림 전에 인라인 스크립트가, 붙은 뒤엔 1분마다 다시 고른다 */
export function PhaseBanner({ slots }: { slots: Record<FestivalPhase, ReactNode> }) {
  const id = useId()
  // 탭 이동으로 브라우저가 처음 그릴 때는 바로 맞는 시점으로 시작한다. 서버 HTML 과 다른 값은 스크립트가 이미 맞춰 둔 DOM 이 이긴다
  const [phase, setPhase] = useState<FestivalPhase>(() =>
    typeof window === 'undefined' ? SERVER_PHASE : phaseAt(currentTime()),
  )
  useEffect(() => {
    const timer = setInterval(() => setPhase(phaseAt(currentTime())), 60_000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div id={id} data-phase={phase} suppressHydrationWarning className="group">
      {/* 배너보다 먼저 두어야 배너가 그려지기 전에 돈다 */}
      <InlineScript html={phaseScript(id)} />
      {(Object.keys(SHOW_ON) as FestivalPhase[]).map((p) => (
        <div key={p} className={`hidden ${SHOW_ON[p]}`}>
          {slots[p]}
        </div>
      ))}
    </div>
  )
}
