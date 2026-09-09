'use client'

import { useLang } from '@/components/lang-provider'
import { DOCK_TIER_BOTTOM } from '@/libs/dock'
import type { Artist } from '@/mocks/types'

export function ScheduleList({
  items,
  activeId,
  onSelect,
}: {
  items: Artist[]
  activeId: string | null
  onSelect: (artist: Artist) => void
}) {
  const { lang } = useLang()

  return (
    <ol
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain pt-5 pr-5 pl-7"
      style={{ paddingBottom: DOCK_TIER_BOTTOM }}
    >
      {items.map((artist) => {
        const active = artist.id === activeId
        return (
          <li key={artist.id} className="relative pb-3 pl-7">
            {/* 레일과 가지. 항목마다 한 토막씩 이어 붙어 하나의 선으로 보인다 */}
            <span aria-hidden className="absolute top-0 left-0 h-full w-px bg-line" />
            <span
              aria-hidden
              className={`absolute top-8 left-0 h-px w-7 ${active ? 'bg-accent' : 'bg-line'}`}
            />
            <button
              type="button"
              onClick={() => onSelect(artist)}
              aria-current={active ? 'true' : undefined}
              className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                active ? 'bg-accent text-accent-ink' : 'bg-surface-muted text-ink'
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-[15px] leading-5 font-medium">
                  {artist.name[lang]}
                </span>
                <span
                  className={`mt-0.5 block truncate text-[12px] leading-4 ${
                    active ? 'text-accent-ink/75' : 'text-ink-muted'
                  }`}
                >
                  {artist.place[lang]}
                </span>
              </span>
              <span
                className={`shrink-0 text-[13px] leading-5 tabular-nums ${
                  active ? 'text-accent-ink' : 'text-ink-muted'
                }`}
              >
                {artist.start}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
