'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useMemo, useRef, useState, type RefObject } from 'react'
import { useCloseOnBack } from '@/shared/history/useCloseOnBack'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import type { MapPlace } from './map-place'
import { PlaceRows } from './PlaceRows'
import { searchPlaces, type SearchablePlace, toQuery, toSearchable } from './search-places'

// 결과 없음 그림. 지도 마커 모양 핀에 물음표를 넣어 그 자리에 찾는 곳이 없다는 뜻으로 읽힌다
function EmptyPin() {
  return (
    <svg aria-hidden viewBox="-21 -21 42 54" className="h-16 w-[50px]">
      <path
        d="M0 31C-6 22-19 12-19 0A19 19 0 0 1 19 0C19 12 6 22 0 31Z"
        className="fill-accent opacity-85"
      />
      <circle r="12" className="fill-bg" />
      <text y="6" textAnchor="middle" fontSize="17" fontWeight="700" className="fill-accent">
        ?
      </text>
    </svg>
  )
}

function BackIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
    >
      <path d="M15 5 8 12l7 7" />
    </svg>
  )
}

// 검색 입력칸에 남은 포커스를 풀어 키보드를 내린다
function blurSearch() {
  if (document.activeElement instanceof HTMLInputElement) document.activeElement.blur()
}

// 닫기 · 입력칸 · 지우기. 두 버튼은 입력칸 안에 넣으면 누를 때 입력칸이 포커스를 먼저 가져가서 형제로 양 끝에 얹는다
function SearchField({
  value,
  onChange,
  inputRef,
}: {
  value: string
  onChange: (value: string) => void
  inputRef: RefObject<HTMLInputElement | null>
}) {
  const { search } = getMessages(useLocale()).map

  return (
    <div className="relative">
      <label
        data-query={value ? '' : undefined}
        className="flex h-11 items-center rounded-xl bg-text/5 pr-3 pl-11 data-query:pr-11"
      >
        <input
          ref={inputRef}
          type="search"
          enterKeyHint="search"
          // 장소 이름은 사전에 없는 말이 많아 고쳐 쓰지 않게 하고, iOS 가 키보드 위에 띄우는 자동 완성 막대도 줄인다
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={search.placeholder}
          aria-label={search.open}
          className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:font-normal placeholder:text-text-muted [&::-webkit-search-cancel-button]:appearance-none"
        />
      </label>
      <Dialog.Close
        aria-label={search.close}
        className="absolute inset-y-0 left-0 grid w-11 place-items-center"
      >
        <BackIcon />
      </Dialog.Close>
      {value && (
        <button
          type="button"
          aria-label={search.clear}
          onClick={() => {
            onChange('')
            inputRef.current?.focus()
          }}
          className="absolute top-1/2 right-1.5 grid -translate-y-1/2 place-items-center p-2"
        >
          <span
            aria-hidden
            className="grid size-[18px] place-items-center rounded-full bg-text/20 text-xs leading-none text-bg"
          >
            ×
          </span>
        </button>
      )}
    </div>
  )
}

// 검색어가 비면 안내, 걸린 곳이 없으면 빈 그림, 있으면 결과 줄
function SearchResults({
  text,
  searchable,
  onPick,
}: {
  text: string
  searchable: SearchablePlace[]
  onPick: (place: MapPlace) => void
}) {
  const { search, list } = getMessages(useLocale()).map
  const trimmed = text.trim()
  const query = useMemo(() => toQuery(trimmed), [trimmed])
  const results = useMemo(() => searchPlaces(searchable, query), [searchable, query])

  if (!trimmed) {
    return (
      <p className="py-4 text-sm leading-normal text-text-muted">
        {search.tip}
        <span className="block text-[13px]">{search.tipExample}</span>
      </p>
    )
  }
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 pt-16 text-center font-medium">
        <EmptyPin />
        <div className="flex flex-col gap-1.5">
          <p className="text-lg leading-[1.2] font-semibold break-keep text-secondary">
            {search.empty.replace('{query}', trimmed)}
          </p>
          <p className="leading-[1.32] text-text-muted">{search.emptyHint}</p>
        </div>
      </div>
    )
  }
  return (
    <>
      <div className="flex items-baseline gap-1.5 pt-3 pb-1">
        <h2 className="text-[15px] font-semibold">
          {search.resultTitle.replace('{query}', trimmed)}
        </h2>
        <span className="text-[13px] text-text-muted">
          {list.count.replace('{count}', String(results.length))}
        </span>
      </div>
      <PlaceRows places={results} query={query} onPick={onPick} />
    </>
  )
}

// 열릴 때마다 새로 붙어 검색어가 비어 시작한다
function SearchPanel({
  searchable,
  onPick,
}: {
  searchable: SearchablePlace[]
  onPick: (place: MapPlace) => void
}) {
  const { search } = getMessages(useLocale()).map
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <Dialog.Content
      aria-describedby={undefined}
      // 닫기 버튼 대신 입력칸에 포커스해 키보드를 바로 올린다
      onOpenAutoFocus={(event) => {
        event.preventDefault()
        inputRef.current?.focus()
      }}
      // 제목 줄은 덮지 않아, 입력칸이 지도 위 검색창과 같은 자리에 온다
      className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+var(--page-title-height))] bottom-0 z-50 mx-auto flex max-w-(--app-max-width) flex-col bg-bg text-text outline-none"
    >
      <Dialog.Title className="sr-only">{search.open}</Dialog.Title>
      <form
        role="search"
        // 결과는 이미 떠 있으니 검색 키는 가려진 결과를 보이게 키보드만 내린다
        onSubmit={(event) => {
          event.preventDefault()
          inputRef.current?.blur()
        }}
        className="border-b border-sheet-divider px-[17px] pt-3 pb-2"
      >
        <SearchField value={text} onChange={setText} inputRef={inputRef} />
      </form>
      {/* 목록을 밀면 훑어보려는 것이라 키보드를 내려 가려진 결과를 드러낸다 */}
      <div
        onTouchMove={blurSearch}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-[17px] pb-[calc(env(safe-area-inset-bottom)+24px)]"
      >
        <SearchResults text={text} searchable={searchable} onPick={onPick} />
      </div>
    </Dialog.Content>
  )
}

/** 이름 · 운영으로 장소를 찾는 전체 화면. 치는 대로 결과가 바뀌고, 결과를 누르면 그 장소를 고른다. ‹ · 뒤로 가기 · Esc 로 닫는다 */
export function PlaceSearch({
  open,
  places,
  onPick,
  onClose,
}: {
  open: boolean
  places: MapPlace[]
  onPick: (place: MapPlace) => void
  onClose: () => void
}) {
  useCloseOnBack(open, onClose)
  // 칠 때마다 접지 않게 장소 목록을 한 번만 접어 둔다
  const searchable = useMemo(() => toSearchable(places), [places])

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <SearchPanel searchable={searchable} onPick={onPick} />
      </Dialog.Portal>
    </Dialog.Root>
  )
}
