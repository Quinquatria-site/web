'use client'

import { useEffect, useMemo, useState } from 'react'
import { BottomSheet, BottomSheetTitle } from '@/shared/bottom-sheet/BottomSheet'
import { contentLang } from '@/shared/i18n/locales'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { Photo } from '@/shared/photo/Photo'
import { type MapPlace, type PlaceCode, placeHours, placeLabel } from './map-place'
import { Highlight } from './Highlight'
import { FILTER_CODES } from './PlaceFilter'
import { PLACE_SHEET_PEEK, PlaceBadge } from './PlaceSheet'
import { type SearchQuery, toQuery } from './search-places'

// 한 번에 더 그리는 줄 수. 장소는 이미 다 받아 두고 그리기만 나눈다
const PAGE_SIZE = 20

// 1단계에서 손잡이 줄(42)·제목 줄(40)·바닥 여백(24)을 뺀 높이. 빈 안내를 이 안 가운데에 둔다
const EMPTY_HEIGHT = PLACE_SHEET_PEEK - 42 - 40 - 24

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

// 사진 · 종류 배지와 번호 · 이름 · 운영과 시간. 누르면 그 장소 상세로 간다
function PlaceRow({
  place,
  query,
  onPick,
}: {
  place: MapPlace
  query: SearchQuery
  onPick: (place: MapPlace) => void
}) {
  const { places } = getMessages(useLocale()).map
  const label = placeLabel(place)
  const lang = contentLang(place.language_code)
  const hours = placeHours(place)

  return (
    <li className="border-b border-sheet-divider last:border-b-0">
      <button
        type="button"
        onClick={() => onPick(place)}
        className="flex w-full gap-3 py-3 text-left"
      >
        <div className="size-16 shrink-0 overflow-hidden rounded-xl">
          <Photo src={place.place_image_uri?.[0] ?? null} alt="" sizes="64px" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <PlaceBadge place={place} />
            {label && <span className="text-xs font-semibold text-text-muted">{label}</span>}
          </div>
          {/* 번역이 없어 이름이 비면 종류 이름으로 채운다 */}
          <p lang={lang} className="mt-1 line-clamp-2 text-[15px] leading-snug font-semibold">
            <Highlight text={place.name ?? places[place.code]} query={query} />
          </p>
          {(place.host_college || hours) && (
            <p className="mt-0.5 truncate text-[13px] text-text-muted">
              {place.host_college && (
                <span lang={lang}>
                  <Highlight text={place.host_college} query={query} />
                </span>
              )}
              {place.host_college && hours && ' · '}
              {hours}
            </p>
          )}
        </div>
      </button>
    </li>
  )
}

/** 상단 칩(검색 중이면 검색 결과 안에서 칩)에 맞는 장소 목록 시트. 끝까지 내리면 20곳씩 더 그리고, 줄을 누르면 상세로 간다 */
export function PlaceListSheet({
  open,
  places,
  filter,
  query,
  hidden,
  fullHeight,
  onPick,
  onClose,
}: {
  open: boolean
  /** 칩으로 거른 장소. 지도 마커와 같은 배열이다 */
  places: MapPlace[]
  filter: ReadonlySet<PlaceCode>
  /** 엔터로 확정한 검색어. 있으면 제목이 검색 결과가 되고 걸린 글자를 굵게 한다 */
  query: string | null
  hidden: boolean
  /** 끝까지 올렸을 때 높이. 칩 줄 아래에서 멈춰 칩을 계속 누를 수 있게 한다 */
  fullHeight: string
  onPick: (place: MapPlace) => void
  onClose: () => void
}) {
  const { map } = getMessages(useLocale())
  const searchQuery = useMemo(() => toQuery(query ?? ''), [query])
  const title = query
    ? map.search.resultTitle.replace('{query}', query)
    : filter.size
      ? FILTER_CODES.filter((code) => filter.has(code))
          .map((code) => map.places[code])
          .join(', ')
      : map.filterAll

  // 칩이 바뀌면 목록이 새로 시작하니 처음 20곳만 다시 그린다
  const [count, setCount] = useState(PAGE_SIZE)
  const [countedPlaces, setCountedPlaces] = useState(places)
  if (places !== countedPlaces) {
    setCountedPlaces(places)
    setCount(PAGE_SIZE)
  }

  // 시트 본문은 포털로 한 박자 늦게 붙어서, ref 객체 대신 붙는 순간 받는 콜백 ref 로 잡는다
  const [sentinel, setSentinel] = useState<HTMLLIElement | null>(null)
  const hasMore = count < places.length
  useEffect(() => {
    if (!sentinel) return
    // 1단계에선 본문이 잘려 끝이 보이지 않으니, 끌어 올려 끝까지 내렸을 때만 늘어난다
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setCount((n) => n + PAGE_SIZE),
      { rootMargin: '0px 0px 200px 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
    // 늘린 뒤에도 끝이 보이는 채면 감시를 새로 걸어야 다시 알려 준다
  }, [sentinel, count])

  return (
    <BottomSheet
      open={open}
      hidden={hidden}
      peekHeight={PLACE_SHEET_PEEK}
      fullHeight={fullHeight}
      // 끝까지 올려도 위 칩으로 목록을 바꿀 수 있게 뒤 화면을 막지 않는다
      blockBehind={false}
      onClose={onClose}
    >
      <div className="flex items-baseline gap-1.5 px-2 pb-1">
        <BottomSheetTitle className="text-lg leading-[normal] font-semibold">
          {title}
        </BottomSheetTitle>
        <span className="text-sm text-text-muted">
          {map.list.count.replace('{count}', String(places.length))}
        </span>
      </div>
      {places.length === 0 ? (
        <div
          style={{ minHeight: EMPTY_HEIGHT }}
          className="flex flex-col items-center justify-center gap-3 text-center font-medium"
        >
          <EmptyPin />
          <div className="flex flex-col gap-1.5">
            <p className="text-lg leading-[1.2] font-semibold break-keep text-secondary">
              {map.search.empty.replace('{query}', query ?? '')}
            </p>
            <p className="leading-[1.32] text-text-muted">{map.search.emptyHint}</p>
          </div>
        </div>
      ) : (
        <ul className="px-2">
          {places.slice(0, count).map((place) => (
            <PlaceRow key={place.id} place={place} query={searchQuery} onPick={onPick} />
          ))}
          {hasMore && <li ref={setSentinel} aria-hidden className="h-px" />}
        </ul>
      )}
    </BottomSheet>
  )
}
