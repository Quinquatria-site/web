import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'
import { LiveBanner } from './LiveBanner'
import { NoticeBanner } from './NoticeBanner'
import type { Performance } from './performance'
import { PhaseBanner } from './PhaseBanner'

/** DAY 탭 위 배너. 축제 시각에 맞는 알림을 고르고, 여는 시간에 공연 중이 있으면 알림 대신 그 공연을 띄운다 */
export async function ScheduleBanner({ live }: { live: Performance | null }) {
  const { schedule } = getMessages(await getLocale())
  return (
    <PhaseBanner
      slots={{
        before: <NoticeBanner title={schedule.festivalBefore} />,
        // 백오피스가 공연 중을 끄지 않아도 여는 시간 밖에서는 믿지 않는다
        open: live ? (
          <LiveBanner performance={live} />
        ) : (
          <NoticeBanner title={schedule.festivalStarted} />
        ),
        break: <NoticeBanner title={schedule.festivalBreak} />,
        after: <NoticeBanner title={schedule.festivalEnded} subtitle={schedule.festivalEndedSub} />,
      }}
    />
  )
}
