'use client'

import { useState } from 'react'
import { DayTabs } from './DayTabs'
import { FESTIVAL_DAYS, groupByFestivalDay } from './festival-days'
import type { Performance } from './performance'
import { Timeline } from './Timeline'

/** 일정표 본문. 고른 축제 일자를 들고 DAY 탭과 그날 일정을 함께 그린다 */
export function ScheduleBoard() {
  const [day, setDay] = useState(0)
  // API 를 붙이면 여기로 받아 온다. 그 전까지는 공연 칸이 모두 숨는다
  const [performances] = useState<Performance[]>([])
  return (
    <div className="flex flex-col gap-6 px-[26px] pt-5">
      <DayTabs value={day} onChange={setDay} />
      <Timeline
        day={day}
        date={FESTIVAL_DAYS[day].date}
        performances={groupByFestivalDay(performances)[day]}
      />
    </div>
  )
}
