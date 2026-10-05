import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'
import { bakeTime, phaseAt } from './festival-phase'
import { LiveBanner } from './LiveBanner'
import { NoticeBanner } from './NoticeBanner'
import type { Performance } from './performance'

/** DAY 탭 위 배너. 공연 중이 있으면 그 공연을, 없으면 페이지를 굽는 시각에 맞는 알림을 띄운다 */
export async function ScheduleBanner({ live }: { live: Performance | null }) {
  if (live) return <LiveBanner performance={live} />

  const { schedule } = getMessages(await getLocale())
  switch (phaseAt(bakeTime())) {
    case 'before':
      return <NoticeBanner title={schedule.festivalBefore} />
    case 'open':
      return <NoticeBanner title={schedule.festivalStarted} />
    case 'break':
      return <NoticeBanner title={schedule.festivalBreak} />
    case 'after':
      return <NoticeBanner title={schedule.festivalEnded} subtitle={schedule.festivalEndedSub} />
  }
}
