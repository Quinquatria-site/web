'use client'

import { useRef, useState } from 'react'
import { useCloseWatcher } from '@/shared/history/useCloseWatcher'
import { contentLang } from '@/shared/i18n/locales'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { type MapPlace, placeLabel } from './map-place'
import { PLACE_BG } from './place-colors'
import { SearchIcon } from './SearchIcon'
import { searchPlaces } from './search-places'

// 걸린 글자를 굵게. 띄어쓰기를 무시하고 걸린 경우처럼 원문에서 그대로 못 찾으면 강조 없이 둔다
function Highlight({ text, query }: { text: string; query: string }) {
  const index = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1
  if (index < 0) return text
  const end = index + query.length
  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-transparent font-extrabold text-inherit">{text.slice(index, end)}</mark>
      {text.slice(end)}
    </>
  )
}

function ResultItem({
  place,
  query,
  onPick,
}: {
  place: MapPlace
  query: string
  onPick: (place: MapPlace) => void
}) {
  const { places, sheet } = getMessages(useLocale()).map
  const lang = contentLang(place.language_code)
  const label = placeLabel(place)

  return (
    <li>
      <button
        type="button"
        onClick={() => onPick(place)}
        className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left"
      >
        <span
          className={`shrink-0 rounded-xl px-2 py-1 text-xs leading-none font-semibold text-text-inverse ${PLACE_BG[place.code]}`}
        >
          {places[place.code]}
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span lang={lang} className="truncate font-semibold">
            <Highlight text={place.name ?? places[place.code]} query={query} />
          </span>
          {(place.host_college || label) && (
            <span className="truncate text-[13px] text-on-map-control/70">
              {place.host_college && (
                <>
                  {sheet.host}{' '}
                  <span lang={lang}>
                    <Highlight text={place.host_college} query={query} />
                  </span>
                </>
              )}
              {place.host_college && label && ' · '}
              {label}
            </span>
          )}
        </span>
      </button>
    </li>
  )
}

/** 지도 위에 뜨는 장소 검색. 이름·운영으로 찾아 고르게 하고, 열 때마다 빈 칸에서 시작하도록 닫으면 내려 둔다 */
export function PlaceSearch({
  places,
  onPick,
  onClose,
}: {
  places: MapPlace[]
  onPick: (place: MapPlace) => void
  onClose: () => void
}) {
  const { search } = getMessages(useLocale()).map
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const trimmed = query.trim()
  const results = searchPlaces(places, trimmed)
  useCloseWatcher(true, onClose)

  const clear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <div className="absolute inset-0 z-[1001]">
      <div aria-hidden onClick={onClose} className="absolute inset-0 bg-bg-inverse/25" />
      {/* 목록이 도크 밑으로 들어가지 않게 도크 높이만큼 비운다 */}
      <div className="pointer-events-none relative flex max-h-full flex-col gap-2 px-[17px] pt-3 pb-(--dock-space) text-on-map-control">
        <form
          role="search"
          // 키보드의 검색 키는 결과를 보려는 것이라 키보드만 내린다
          onSubmit={(event) => {
            event.preventDefault()
            inputRef.current?.blur()
          }}
          className="pointer-events-auto flex items-center gap-2.5"
        >
          <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-map-control-border bg-map-control/92 px-3 shadow-[0_1px_4px_var(--color-map-control-glow)]">
            <SearchIcon className="size-5 shrink-0" />
            <input
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              // 돋보기 누름 안에서 그려져야 iOS 가 키보드를 올려 준다. 그래서 여는 쪽이 flushSync 로 그린다
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
        <div
          // 손가락으로 밀면 결과를 훑는 것이라 키보드를 내려 가려진 결과를 드러낸다. 목록이 줄어 생기는 scroll 은 입력 중이라 쓰지 않는다
          onTouchMove={() => inputRef.current?.blur()}
          className="pointer-events-auto min-h-0 overflow-y-auto overscroll-contain rounded-xl border border-map-control-border bg-map-control/92"
        >
          {!trimmed ? (
            <p className="p-3.5 text-sm leading-normal">
              {search.tip}
              <span className="mt-1 block text-[13px] text-on-map-control/70">
                {search.tipExample}
              </span>
            </p>
          ) : results.length === 0 ? (
            <p className="p-3.5 text-sm leading-normal">
              {search.empty.replace('{query}', trimmed)}
              <span className="mt-1 block text-[13px] text-on-map-control/70">
                {search.emptyHint}
              </span>
            </p>
          ) : (
            <ul aria-label={search.results} className="divide-y divide-on-map-control/20">
              {results.map((place) => (
                <ResultItem key={place.id} place={place} query={trimmed} onPick={onPick} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
