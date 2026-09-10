'use client'

import { useLang } from '@/components/lang-provider'
import { DOCK_TIER_BOTTOM } from '@/libs/dock'
import type { ZoneId } from '../libs/campus'

export type ZoneSelection = ZoneId | 'all'

// 구역 이름은 도면에 찍힌 글자라 언어를 타지 않는다. '전체'만 번역한다.
const ZONE_IDS: ZoneSelection[] = ['all', 'A', 'B', 'C', 'D']

export function ZoneTier({
  selected,
  onSelect,
}: {
  selected: ZoneSelection
  onSelect: (zone: ZoneSelection) => void
}) {
  const { copy } = useLang()

  return (
    // dock 바로 위 한 층. 아래층과 구분되도록 모서리와 크기를 다르게 둔다.
    <div
      className="pointer-events-none absolute inset-x-0 z-[1000] flex justify-end gap-1.5 px-4"
      style={{ bottom: DOCK_TIER_BOTTOM }}
    >
      {ZONE_IDS.map((id) => {
        const active = id === selected
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            aria-pressed={active}
            className={`pointer-events-auto flex h-10 items-center rounded-lg border px-3.5 text-[13px] font-medium transition-colors ${
              active
                ? 'border-accent bg-accent text-accent-ink'
                : 'border-line bg-surface text-ink-muted'
            }`}
          >
            {id === 'all' ? copy.map.zoneAll : id}
          </button>
        )
      })}
    </div>
  )
}
