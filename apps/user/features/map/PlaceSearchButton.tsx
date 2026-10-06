'use client'

import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { SearchIcon } from './SearchIcon'

/** 칩 위에 늘 떠 있는 검색창 모양 버튼. 누르면 검색 화면이 열린다 */
export function PlaceSearchButton({ onClick }: { onClick: () => void }) {
  const { search } = getMessages(useLocale()).map

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-label={search.open}
      onClick={onClick}
      className="pointer-events-auto mb-2 flex h-11 w-full items-center gap-2 rounded-xl border border-map-control-border bg-map-control/80 px-3 text-left text-on-map-control shadow-[0_1px_4px_var(--color-map-control-glow)]"
    >
      <SearchIcon className="size-5 shrink-0" />
      <span className="truncate text-base text-on-map-control/60">{search.placeholder}</span>
    </button>
  )
}
