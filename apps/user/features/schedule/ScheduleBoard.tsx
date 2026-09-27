'use client'

import { useState } from 'react'
import { DayTabs } from './DayTabs'

/** 일정표 본문. 고른 축제 일자를 들고 DAY 탭과 그날 일정을 함께 그린다 */
export function ScheduleBoard() {
  const [day, setDay] = useState(0)
  return (
    <div className="px-[26px] pt-5">
      <DayTabs value={day} onChange={setDay} />
    </div>
  )
}
