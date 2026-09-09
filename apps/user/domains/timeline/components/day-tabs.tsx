'use client'

import { useLang } from '@/components/lang-provider'
import { FESTIVAL_DAYS } from '@/mocks/timeline'
import type { IsoDate } from '@/mocks/types'

export function DayTabs({
  value,
  onChange,
}: {
  value: IsoDate
  onChange: (date: IsoDate) => void
}) {
  const { copy } = useLang()

  return (
    <div className="flex shrink-0 gap-2 px-5 pt-4 pb-3">
      {FESTIVAL_DAYS.map((day, index) => {
        const active = day.date === value
        return (
          <button
            key={day.date}
            type="button"
            aria-pressed={active}
            aria-label={copy.timeline.day(index + 1)}
            onClick={() => onChange(day.date)}
            className={`flex h-10 shrink-0 items-center rounded-full border px-4 text-[13px] font-medium tabular-nums transition-colors ${
              active
                ? 'border-accent bg-accent text-accent-ink'
                : 'border-line bg-surface text-ink-muted'
            }`}
          >
            {day.label}
          </button>
        )
      })}
    </div>
  )
}
