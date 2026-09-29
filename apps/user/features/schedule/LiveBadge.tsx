'use client'

import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'

// 막대마다 길이·출발점을 엇갈려 셋이 같이 오르내리지 않게 한다
const EQ_BARS = [
  { animationDuration: '0.9s', animationDelay: '0s' },
  { animationDuration: '0.7s', animationDelay: '-0.35s' },
  { animationDuration: '1.05s', animationDelay: '-0.6s' },
]

/** 공연 중 뱃지. 앞에 음파 막대 셋이 음악처럼 오르내린다 */
export function LiveBadge() {
  const locale = useLocale()
  return (
    <span className="flex shrink-0 items-center gap-1 rounded-[9px] bg-accent px-1.5 py-0.5 text-xs leading-[normal] font-semibold text-on-accent">
      <span aria-hidden className="flex h-[9px] items-end gap-[1.5px]">
        {EQ_BARS.map((style, i) => (
          <i
            key={i}
            style={style}
            className="h-full w-0.5 origin-bottom animate-live-eq rounded-[1px] bg-on-accent motion-reduce:animate-none"
          />
        ))}
      </span>
      {getMessages(locale).schedule.liveBadge}
    </span>
  )
}
