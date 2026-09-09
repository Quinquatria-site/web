'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { DOCK_TIER_BOTTOM } from '@/libs/dock'
import type { FestivalEvent, IsoDate } from '@/mocks/types'
import { eventsOn, festivalPhase, focusEvent, liveEvent } from '../libs/schedule'
import { DayTabs } from './day-tabs'
import { EventDialog } from './event-dialog'
import { NowBanner } from './now-banner'
import { ScheduleList } from './schedule-list'

export function TimelineView() {
  const phase = festivalPhase()
  const focus = focusEvent()
  const live = liveEvent()
  // 축제가 끝난 뒤에 열어도 빈 날이 잡히지 않도록 지금 가리키는 일정의 날로 연다
  const [date, setDate] = useState<IsoDate>(focus.date)
  const [opened, setOpened] = useState<FestivalEvent | null>(null)
  const rows = useRef(new Map<string, HTMLLIElement>())
  // 다른 날로 건너뛸 때는 그 날의 줄이 그려진 뒤에야 움직일 수 있다
  const pending = useRef<string | null>(null)

  const rowRef = useCallback((id: string, node: HTMLLIElement | null) => {
    if (node) rows.current.set(id, node)
    else rows.current.delete(id)
  }, [])

  const scrollToRow = useCallback((id: string) => {
    rows.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  useEffect(() => {
    const id = pending.current
    if (!id) return
    pending.current = null
    scrollToRow(id)
  }, [date, scrollToRow])

  function jumpToNow() {
    if (focus.date === date) {
      scrollToRow(focus.id)
      return
    }
    pending.current = focus.id
    setDate(focus.date)
  }

  return (
    <div className="flex flex-col" style={{ paddingBottom: DOCK_TIER_BOTTOM }}>
      <PageHeader path="/timeline" />

      <div className="flex flex-col gap-6 pt-6">
        <div className="px-5">
          <NowBanner phase={phase} event={focus} onJump={jumpToNow} />
        </div>

        <div className="px-5">
          <DayTabs value={date} onChange={setDate} />
        </div>

        <ScheduleList
          items={eventsOn(date)}
          liveId={live?.id ?? null}
          rowRef={rowRef}
          onSelect={setOpened}
        />
      </div>

      <EventDialog event={opened} onClose={() => setOpened(null)} />
    </div>
  )
}
