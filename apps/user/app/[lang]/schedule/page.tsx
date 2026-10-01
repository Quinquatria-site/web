import { FESTIVAL_DAYS, groupByFestivalDay } from '@/features/schedule/festival-days'
import { getPerformances } from '@/features/schedule/get-performances'
import { PerformanceImagePreload } from '@/features/schedule/PerformanceImagePreload'
import { ScheduleBanner } from '@/features/schedule/ScheduleBanner'
import { ScheduleBoard } from '@/features/schedule/ScheduleBoard'
import { Timeline, performanceAnchorId } from '@/features/schedule/Timeline'
import { PageHeader } from '@/shared/header/PageHeader'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'

/** 일정표 탭. 배너와 두 날치 타임라인을 미리 그려 두고, 탭만 브라우저에서 고른다 */
export default async function SchedulePage() {
  const { pages } = getMessages(await getLocale())
  // 백오피스가 공연 중을 바꾸면 performances 태그로 재검증돼 이 페이지가 다시 그려진다
  const performances = await getPerformances()
  const byDay = groupByFestivalDay(performances)
  const live = performances.find((p) => p.is_live) ?? null
  const liveDay = live ? FESTIVAL_DAYS.findIndex(({ date }) => date === live.date) : -1

  return (
    <>
      <PerformanceImagePreload performances={performances} />
      <PageHeader title={pages.schedule} />
      <ScheduleBoard
        banner={<ScheduleBanner live={live} />}
        panels={FESTIVAL_DAYS.map(({ date }, i) => (
          <Timeline key={date} date={date} performances={byDay[i]} />
        ))}
        liveDay={liveDay === -1 ? null : liveDay}
        liveAnchor={live && liveDay !== -1 ? performanceAnchorId(live.id) : null}
      />
    </>
  )
}
