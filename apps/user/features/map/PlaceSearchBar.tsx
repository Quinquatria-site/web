'use client'

import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { SearchIcon } from './SearchIcon'

/** 칩 위에 늘 떠 있는 입력창 모양 버튼. 누르면 같은 자리에 진짜 검색창이 열려 아이콘만 둘 때보다 검색인 줄 바로 안다. 검색 중이면 검색어와 지우기를 보인다 */
export function PlaceSearchBar({
  query,
  onOpen,
  onClear,
}: {
  query: string | null
  onOpen: () => void
  onClear: () => void
}) {
  const { search } = getMessages(useLocale()).map
  return (
    <div className="pointer-events-auto relative mb-2">
      <button
        type="button"
        aria-label={query ? `${search.open}: ${query}` : search.open}
        onClick={onOpen}
        className="flex h-11 w-full items-center gap-2 rounded-xl border border-map-control-border bg-map-control/80 px-3 text-left text-on-map-control shadow-[0_1px_4px_var(--color-map-control-glow)] data-query:pr-11"
        data-query={query ? '' : undefined}
      >
        <SearchIcon className="size-5 shrink-0" />
        {query ? (
          <span className="truncate text-base font-semibold">{query}</span>
        ) : (
          <span className="truncate text-base text-on-map-control/60">{search.placeholder}</span>
        )}
      </button>
      {/* 막대 버튼 안에 넣으면 버튼이 겹쳐서 형제로 오른쪽 끝에 얹는다 */}
      {query && (
        <button
          type="button"
          aria-label={search.clear}
          onClick={onClear}
          className="absolute top-1/2 right-1.5 grid -translate-y-1/2 place-items-center p-2 text-on-map-control"
        >
          <span
            aria-hidden
            className="grid size-[18px] place-items-center rounded-full bg-on-map-control/30 text-xs leading-none text-map-control"
          >
            ×
          </span>
        </button>
      )}
    </div>
  )
}
