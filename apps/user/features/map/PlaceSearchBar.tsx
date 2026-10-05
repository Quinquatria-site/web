'use client'

import { useRef } from 'react'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { SearchIcon } from './SearchIcon'

/** 칩 위에 늘 떠 있는 장소 검색 입력칸. 누르면 목록 시트가 올라오고, 치는 대로 목록과 지도가 바뀐다 */
export function PlaceSearchBar({
  query,
  onQueryChange,
  onFocus,
}: {
  query: string
  onQueryChange: (query: string) => void
  onFocus: () => void
}) {
  const { search } = getMessages(useLocale()).map
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <form
      role="search"
      // 결과는 이미 목록에 떠 있으니 검색 키는 가려진 결과를 보이게 키보드만 내린다
      onSubmit={(event) => {
        event.preventDefault()
        inputRef.current?.blur()
      }}
      className="pointer-events-auto relative mb-2"
    >
      <label
        data-query={query ? '' : undefined}
        className="flex h-11 w-full items-center gap-2 rounded-xl border border-map-control-border bg-map-control/80 px-3 text-on-map-control shadow-[0_1px_4px_var(--color-map-control-glow)] data-query:pr-11"
      >
        <SearchIcon className="size-5 shrink-0" />
        <input
          ref={inputRef}
          type="search"
          enterKeyHint="search"
          // 장소 이름은 사전에 없는 말이 많아 고쳐 쓰지 않게 하고, iOS 가 키보드 위에 띄우는 자동 완성 막대도 줄인다
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onFocus={onFocus}
          placeholder={search.placeholder}
          aria-label={search.open}
          className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:font-normal placeholder:text-on-map-control/60 [&::-webkit-search-cancel-button]:appearance-none"
        />
      </label>
      {/* 입력칸 안에 넣으면 누를 때 입력칸이 포커스를 먼저 가져가서 형제로 오른쪽 끝에 얹는다 */}
      {query && (
        <button
          type="button"
          aria-label={search.clear}
          onClick={() => {
            onQueryChange('')
            inputRef.current?.focus()
          }}
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
    </form>
  )
}
