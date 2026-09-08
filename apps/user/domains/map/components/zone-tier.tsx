'use client'

import { DOCK_TIER_BOTTOM } from '@/libs/dock'
import type { ZoneId } from '../libs/campus'

export type ZoneSelection = ZoneId | 'all'

const CHOICES: { id: ZoneSelection; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'A', label: 'A' },
  { id: 'B', label: 'B' },
  { id: 'C', label: 'C' },
  { id: 'D', label: 'D' },
]

export function ZoneTier({
  selected,
  onSelect,
}: {
  selected: ZoneSelection
  onSelect: (zone: ZoneSelection) => void
}) {
  return (
    // dock 바로 위 한 층. 아래층과 구분되도록 모서리와 크기를 다르게 둔다.
    <div
      className="pointer-events-none absolute inset-x-0 z-[1000] flex justify-end gap-1.5 px-4"
      style={{ bottom: DOCK_TIER_BOTTOM }}
    >
      {CHOICES.map((choice) => {
        const active = choice.id === selected
        return (
          <button
            key={choice.id}
            type="button"
            onClick={() => onSelect(choice.id)}
            aria-pressed={active}
            className={`pointer-events-auto flex h-10 items-center rounded-lg border px-3.5 text-[13px] font-medium transition-colors ${
              active
                ? 'border-accent bg-accent text-accent-ink'
                : 'border-line bg-surface/85 text-ink-muted backdrop-blur-sm'
            }`}
          >
            {choice.label}
          </button>
        )
      })}
    </div>
  )
}
