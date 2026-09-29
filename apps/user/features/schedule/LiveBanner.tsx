import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'
import type { Performance } from './performance'
import { performanceAnchorId } from './Timeline'

/** DAY 탭 위 알림 배너. 공연 중이면 그 공연을 띄우고 누르면 타임라인의 그 카드로 옮겨 가며, 없으면 축제 시작 문구를 띄운다 */
export async function LiveBanner({ performance }: { performance: Performance | null }) {
  const { schedule } = getMessages(await getLocale())
  if (!performance) {
    return (
      <p className="flex h-[62px] items-center justify-center rounded-xl border border-border-strong bg-white text-lg leading-[normal] font-bold text-text shadow-[0_2px_8px_rgb(0_0_0/0.08)]">
        {schedule.festivalStarted}
      </p>
    )
  }
  return (
    <a
      href={`#${performanceAnchorId(performance.id)}`}
      className="flex h-[100px] flex-col justify-between rounded-xl border border-(--sunlight) bg-bg-subtle px-3.5 pt-[11px] pb-3 text-text shadow-[0_2px_16px_rgb(249_163_66/0.4)]"
    >
      <span className="flex items-center gap-3 text-base leading-[normal] font-semibold">
        <span
          aria-hidden
          className="size-2.5 rounded-full bg-secondary shadow-[0_0_4px_3px_var(--sunlight)]"
        />
        {schedule.liveNow}
      </span>
      <span className="self-end truncate text-2xl leading-[normal] font-semibold">
        {performance.title}
      </span>
    </a>
  )
}
