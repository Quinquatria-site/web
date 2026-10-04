'use client'

import { useRef, useState } from 'react'
import { useCloseWatcher } from '@/shared/history/useCloseWatcher'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { SearchIcon } from './SearchIcon'

/** 지도 위에 뜨는 장소 검색창. 치는 동안엔 안내만 두고, 검색 키를 누르면 검색어를 넘겨 결과는 목록 시트가 보여 준다 */
export function PlaceSearch({
  initialQuery,
  onSubmit,
  onClose,
}: {
  /** 다시 열면 지난 검색어를 채워 고쳐 칠 수 있게 한다 */
  initialQuery: string
  onSubmit: (query: string) => void
  onClose: () => void
}) {
  const { search } = getMessages(useLocale()).map
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState(initialQuery)
  useCloseWatcher(true, onClose)

  const clear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <div className="absolute inset-0 z-[1001]">
      <div aria-hidden onClick={onClose} className="absolute inset-0 bg-bg-inverse/25" />
      <div className="pointer-events-none relative flex max-h-full flex-col gap-2 px-[17px] pt-3 pb-(--dock-space) text-on-map-control">
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            const trimmed = query.trim()
            // 빈칸으로 누르면 찾을 게 없어 키보드만 내린다
            if (trimmed) onSubmit(trimmed)
            else inputRef.current?.blur()
          }}
          className="pointer-events-auto flex items-center gap-2.5"
        >
          <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-map-control-border bg-map-control/92 px-3 shadow-[0_1px_4px_var(--color-map-control-glow)]">
            <SearchIcon className="size-5 shrink-0" />
            <input
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              // 검색 막대 누름 안에서 그려져야 iOS 가 키보드를 올려 준다. 그래서 여는 쪽이 flushSync 로 그린다
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={search.placeholder}
              aria-label={search.open}
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-on-map-control/55 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {query && (
              <button
                type="button"
                aria-label={search.clear}
                onClick={clear}
                className="-m-2 grid shrink-0 place-items-center p-2"
              >
                <span
                  aria-hidden
                  className="grid size-[18px] place-items-center rounded-full bg-on-map-control/30 text-xs leading-none text-map-control"
                >
                  ×
                </span>
              </button>
            )}
          </label>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 py-2 font-semibold drop-shadow-[0_0_4px_var(--color-bg-inverse)]"
          >
            {search.cancel}
          </button>
        </form>
        <p className="pointer-events-auto rounded-xl border border-map-control-border bg-map-control/92 p-3.5 text-sm leading-normal">
          {search.tip}
          <span className="mt-1 block text-[13px] text-on-map-control/70">{search.tipExample}</span>
        </p>
      </div>
    </div>
  )
}
