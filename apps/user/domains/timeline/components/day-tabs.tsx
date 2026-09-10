'use client'

import { motion } from 'motion/react'
import { useLang } from '@/components/lang-provider'
import { FESTIVAL_DAYS } from '@/mocks/timeline'
import type { IsoDate } from '@/mocks/types'

const SPRING = { type: 'spring', stiffness: 500, damping: 34 } as const

export function DayTabs({
  value,
  onChange,
}: {
  value: IsoDate
  onChange: (date: IsoDate) => void
}) {
  const { copy } = useLang()

  return (
    <div className="flex gap-2">
      {FESTIVAL_DAYS.map((day, index) => {
        const active = day.date === value
        return (
          <button
            key={day.date}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(day.date)}
            className="relative flex h-12 flex-1 items-center justify-center gap-2 rounded-control border border-line bg-surface-muted"
          >
            {/* layoutId 가 같아 탭을 옮기면 알약이 스르륵 따라온다 */}
            {active && (
              <motion.span
                layoutId="day-pill"
                transition={SPRING}
                className="absolute inset-0 rounded-control bg-accent"
              />
            )}
            <span
              className={`relative text-[15px] leading-5 font-semibold tracking-wide ${
                active ? 'text-accent-ink' : 'text-ink-muted'
              }`}
            >
              {copy.timeline.day(index + 1)}
            </span>
            <span
              className={`relative text-[12px] leading-4 tabular-nums ${
                active ? 'text-accent-ink/75' : 'text-ink-muted/70'
              }`}
            >
              {day.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
