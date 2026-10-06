'use client'

import { useEffect, useRef, useState } from 'react'
import { contentLang } from '@/shared/i18n/locales'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { Photo } from '@/shared/photo/Photo'
import { type MapPlace, placeHours, placeLabel } from './map-place'
import { Highlight } from './Highlight'
import { PlaceBadge } from './PlaceSheet'
import type { SearchQuery } from './search-places'

// 한 번에 더 그리는 줄 수. 장소는 이미 다 받아 두고 그리기만 나눈다
const PAGE_SIZE = 20

// 글자를 그대로 두거나, 검색어가 있으면 걸린 글자를 굵게
function Text({ text, query }: { text: string; query?: SearchQuery }) {
  return query ? <Highlight text={text} query={query} /> : text
}

// 사진 · 종류 배지와 번호 · 이름 · 운영과 시간. 누르면 그 장소 상세로 간다
function PlaceRow({
  place,
  query,
  onPick,
}: {
  place: MapPlace
  query?: SearchQuery
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
            <Text text={place.name ?? places[place.code]} query={query} />
          </p>
          {(place.host_college || hours) && (
            <p className="mt-0.5 truncate text-[13px] text-text-muted">
              {place.host_college && (
                <span lang={lang}>
                  <Text text={place.host_college} query={query} />
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

// 목록을 감싼 세로 스크롤 칸. 시트 본문이든 검색 화면이든 가장 가까운 스크롤 조상이다
function scrollParent(element: HTMLElement) {
  for (let node = element.parentElement; node; node = node.parentElement) {
    if (/auto|scroll/.test(getComputedStyle(node).overflowY)) return node
  }
  return null
}

/** 장소 줄 목록. 끝까지 내리면 20곳씩 더 그리고, 목록이 바뀌면 맨 위 20곳부터 다시 그린다. query 를 주면 걸린 글자를 굵게 한다 */
export function PlaceRows({
  places,
  query,
  onPick,
}: {
  places: MapPlace[]
  query?: SearchQuery
  onPick: (place: MapPlace) => void
}) {
  const [count, setCount] = useState(PAGE_SIZE)
  const [countedPlaces, setCountedPlaces] = useState(places)
  if (places !== countedPlaces) {
    setCountedPlaces(places)
    setCount(PAGE_SIZE)
  }
  // 목록이 바뀌면 이전 스크롤 자리에 남지 않게 맨 위로 올린다
  const listRef = useRef<HTMLUListElement>(null)
  useEffect(() => {
    if (listRef.current) scrollParent(listRef.current)?.scrollTo({ top: 0 })
  }, [countedPlaces])

  // 시트 본문은 포털로 한 박자 늦게 붙어서, ref 객체 대신 붙는 순간 받는 콜백 ref 로 잡는다
  const [sentinel, setSentinel] = useState<HTMLLIElement | null>(null)
  const hasMore = count < places.length
  useEffect(() => {
    if (!sentinel) return
    // 시트 1단계에선 본문이 잘려 끝이 보이지 않으니, 끌어 올려 끝까지 내렸을 때만 늘어난다
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setCount((n) => n + PAGE_SIZE),
      { rootMargin: '0px 0px 200px 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
    // 늘린 뒤에도 끝이 보이는 채면 감시를 새로 걸어야 다시 알려 준다
  }, [sentinel, count])

  return (
    <ul ref={listRef}>
      {places.slice(0, count).map((place) => (
        <PlaceRow key={place.id} place={place} query={query} onPick={onPick} />
      ))}
      {/* 줄이 늘 때 브라우저가 이 끝을 기준으로 스크롤을 붙들면 끝이 계속 보여 한 번에 다 그려진다 */}
      {hasMore && <li ref={setSentinel} aria-hidden className="h-px [overflow-anchor:none]" />}
    </ul>
  )
}
