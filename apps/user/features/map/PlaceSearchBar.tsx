'use client'

import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { SearchIcon } from './SearchIcon'

/** 칩 위에 늘 떠 있는 입력창 모양 버튼. 누르면 같은 자리에 진짜 검색창이 열려 아이콘만 둘 때보다 검색인 줄 바로 안다 */
export function PlaceSearchBar({ onOpen }: { onOpen: () => void }) {
  const { search } = getMessages(useLocale()).map
  return (
    <button
      type="button"
      aria-label={search.open}
      onClick={onOpen}
      className="pointer-events-auto mb-2 flex h-11 w-full items-center gap-2 rounded-xl border border-map-control-border bg-map-control/80 px-3 text-left text-on-map-control shadow-[0_1px_4px_var(--color-map-control-glow)]"
    >
      <SearchIcon className="size-5 shrink-0" />
      <span className="truncate text-base text-on-map-control/60">{search.placeholder}</span>
    </button>
  )
}
