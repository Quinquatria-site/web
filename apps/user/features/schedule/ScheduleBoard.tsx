'use client'

import { type MouseEvent, type ReactNode, useEffect, useState } from 'react'
import { DayTabs, SCHEDULE_PANEL_ID, dayTabId } from './DayTabs'

/** 일정표 본문. 탭 상태만 들고, 서버가 그린 배너와 날짜별 타임라인 중 고른 날 것을 보여 준다 */
export function ScheduleBoard({
  banner,
  panels,
  liveDay,
  liveAnchor,
}: {
  banner: ReactNode
  panels: ReactNode[]
  liveDay: number | null
  liveAnchor: string | null
}) {
  const [day, setDay] = useState(liveDay ?? 0)
  // 매번 새 객체라 같은 카드를 두 번 눌러도 다시 스크롤한다
  const [scrollRequest, setScrollRequest] = useState<{ id: string } | null>(null)

  // 탭을 바꾼 뒤 그 날 타임라인이 그려지고 나서 스크롤해야 카드가 있다
  useEffect(() => {
    if (!scrollRequest) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    document
      .getElementById(scrollRequest.id)
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
  }, [scrollRequest])

  // 배너 링크는 JS 없이도 옮겨 가게 두고, 붙은 뒤에는 공연 중인 날 탭으로 먼저 바꾼다
  function handleBannerClick(e: MouseEvent) {
    if (liveDay === null || !liveAnchor || !(e.target as Element).closest('a')) return
    e.preventDefault()
    setDay(liveDay)
    setScrollRequest({ id: liveAnchor })
  }

  return (
    <div className="flex flex-col px-[26px] pt-5">
      <div onClick={handleBannerClick} className="mb-[18px]">
        {banner}
      </div>
      <DayTabs value={day} onChange={setDay} />
      <div
        id={SCHEDULE_PANEL_ID}
        role="tabpanel"
        aria-labelledby={dayTabId(day)}
        className="mt-[22px]"
      >
        {panels[day]}
      </div>
    </div>
  )
}
