import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'
import type { Performance } from './performance'
import { performanceAnchorId } from './Timeline'

/** 공연 중 배너. 그 공연을 띄우고 누르면 타임라인의 그 카드로 옮겨 간다 */
export async function LiveBanner({ performance }: { performance: Performance }) {
  const { schedule } = getMessages(await getLocale())
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
