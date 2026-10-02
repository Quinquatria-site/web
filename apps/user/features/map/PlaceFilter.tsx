'use client'

import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import type { PlaceCode } from './map-place'

// 피그마 칩 순서
const FILTER_CODES: PlaceCode[] = [
  'BOOTH',
  'PUB',
  'FOODTRUCK',
  'PHOTOBOOTH',
  'BRACELET',
  'MEDI',
  'TRASHCAN',
]

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="pointer-events-auto h-[30px] min-w-[58px] rounded-full border border-accent bg-bg px-2 text-sm leading-none font-semibold whitespace-nowrap text-accent aria-pressed:bg-accent aria-pressed:text-on-accent"
    >
      {children}
    </button>
  )
}

/** 지도 위 장소 종류 칩. 여럿 켤 수 있고, 아무것도 안 켜면 '전체'다. 폭이 모자라면 다음 줄로 넘어간다 */
export function PlaceFilter({
  selected,
  onToggle,
  onReset,
}: {
  selected: ReadonlySet<PlaceCode>
  onToggle: (code: PlaceCode) => void
  onReset: () => void
}) {
  const { filterLabel, filterAll, places } = getMessages(useLocale()).map

  return (
    <div
      role="group"
      aria-label={filterLabel}
      className="flex flex-wrap gap-2 drop-shadow-[0_0_2px_var(--color-accent)]"
    >
      <Chip pressed={selected.size === 0} onClick={onReset}>
        {filterAll}
      </Chip>
      {FILTER_CODES.map((code) => (
        <Chip key={code} pressed={selected.has(code)} onClick={() => onToggle(code)}>
          {places[code]}
        </Chip>
      ))}
    </div>
  )
}
