import { FESTIVAL_DAYS, groupByFestivalDay } from '@/features/schedule/festival-days'
import { LiveBanner } from '@/features/schedule/LiveBanner'
import type { Performance } from '@/features/schedule/performance'
import { ScheduleBoard } from '@/features/schedule/ScheduleBoard'
import { Timeline, performanceAnchorId } from '@/features/schedule/Timeline'
import { PageHeader } from '@/shared/header/PageHeader'

/** 일정표 탭. 배너와 두 날치 타임라인을 미리 그려 두고, 탭만 브라우저에서 고른다 */
export default function SchedulePage() {
  // API 를 붙이면 여기서 받아 온다. 백오피스가 공연 중을 바꾸면 재검증돼 이 페이지가 다시 그려진다
  const performances: Performance[] = []
  const byDay = groupByFestivalDay(performances)
  const live = performances.find((p) => p.is_live) ?? null
  const liveDay = live ? FESTIVAL_DAYS.findIndex(({ date }) => date === live.date) : -1

  return (
    <>
      <PageHeader title="축제 일정표" />
      <ScheduleBoard
        banner={<LiveBanner performance={live} />}
        panels={FESTIVAL_DAYS.map(({ date }, i) => (
          <Timeline key={date} date={date} performances={byDay[i]} />
        ))}
        liveDay={liveDay === -1 ? null : liveDay}
        liveAnchor={live && liveDay !== -1 ? performanceAnchorId(live.id) : null}
      />
    </>
  )
}
