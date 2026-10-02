'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { dockStowStore } from '@/shared/dock/dock-stow-store'
import { localePath } from '@/shared/i18n/paths'
import { useLocale } from '@/shared/i18n/useLocale'
import { type MapPlace, type PlaceCode, type PlaceId, toPlaceId } from './map-place'
import { PlaceFilter } from './PlaceFilter'
import { PLACE_SHEET_PEEK, PlaceSheet } from './PlaceSheet'

// 지도(/map) 위에 쌓은 장소 기록 표시. 뒤로 가기로 돌아왔을 때 되돌릴 기록인지 가린다
const PLACE_ENTRY_KEY = 'placeOverMap'
// Next 가 넘긴 객체에 라우터 상태를 덧붙여서 매번 새로 만든다
const placeEntry = () => ({ [PLACE_ENTRY_KEY]: true })

// Leaflet 은 불러오는 순간 window 를 읽어서 빌드 때 굽지 않고 브라우저에서만 싣는다
const CampusMap = dynamic(() => import('./CampusMap'), { ssr: false })

/** 머리 아래 남은 화면을 지도로 채운다. 도크는 지도 위에 떠 있고, 고른 장소와 그 시트는 여기서 들고 있다 */
export function MapView({
  places,
  initialPlaceId = null,
}: {
  places: MapPlace[]
  /** 장소 주소(/map/12)로 들어왔을 때 처음부터 고를 장소 */
  initialPlaceId?: PlaceId | null
}) {
  const [selectedId, setSelectedId] = useState<PlaceId | null>(initialPlaceId)
  const [focusRequest, setFocusRequest] = useState(0)
  const [dragging, setDragging] = useState(false)
  // 비어 있으면 전체
  const [filter, setFilter] = useState<ReadonlySet<PlaceCode>>(() => new Set())
  // 연달아 눌러도 앞 누름이 반영된 상태에서 켜고 끈다
  const toggleFilter = useCallback((code: PlaceCode) => {
    setFilter((prev) => {
      const next = new Set(prev)
      if (!next.delete(code)) next.add(code)
      return next
    })
  }, [])
  const resetFilter = useCallback(() => setFilter(new Set()), [])
  // 마커가 목록 변화로 선택 해제를 판단해서, 필터가 그대로면 같은 배열을 넘긴다
  const visiblePlaces = useMemo(
    () => (filter.size ? places.filter((place) => filter.has(place.code)) : places),
    [places, filter],
  )
  // 빈 곳을 탭해 칩·확대 버튼·도크를 걷어 낸 상태. 지도만 넓게 본다
  const [chromeHidden, setChromeHidden] = useState(false)
  // 고른 장소를 주소(/map/12)에 담아 그대로 복사해 홍보할 수 있게 한다. 페이지를 옮기지 않고 주소만 바꾼다
  const mapPath = localePath(useLocale(), '/map')
  // 지도에서 시트를 열며 쌓은 기록이 있는지. 있으면 닫을 때 그 기록을 되돌려, 뒤로 가기가 시트만 닫게 한다
  const pushedRef = useRef(false)
  const select = useCallback(
    (id: PlaceId) => {
      setSelectedId(id)
      setFocusRequest((n) => n + 1)
      // 장소를 고르면 둘러보기가 끝난 것으로 보고 걷어 낸 것들을 되돌린다
      setChromeHidden(false)
      const url = `${mapPath}/${id}`
      if (location.pathname === url) return
      // 시트가 열린 채 다른 장소를 고르면 기록을 더 쌓지 않고 갈아 끼워, 뒤로 가기 한 번에 시트가 닫힌다
      if (location.pathname === mapPath) {
        history.pushState(placeEntry(), '', url)
        pushedRef.current = true
      } else history.replaceState(pushedRef.current ? placeEntry() : null, '', url)
    },
    [mapPath],
  )
  const clearSelection = useCallback(() => {
    setSelectedId(null)
    if (location.pathname === mapPath) return
    if (pushedRef.current) {
      pushedRef.current = false
      history.back()
      // 링크로 바로 들어왔으면 되돌릴 기록이 없어, 뒤로 가기가 사이트를 떠나지 않게 주소만 지도로 바꾼다
    } else history.replaceState(null, '', mapPath)
  }, [mapPath])
  // 뒤로·앞으로 가기로 주소가 바뀌면 고른 장소를 주소에 맞춘다
  useEffect(() => {
    const handlePopState = () => {
      // 사진 뷰어처럼 위에 겹친 기록만 걷혀 돌아온 경우에도 이 장소 기록을 지도 위에 쌓았는지 기억한다
      pushedRef.current = history.state?.[PLACE_ENTRY_KEY] === true
      const match = location.pathname.match(/\/map\/([^/]+)$/)
      setSelectedId(match ? toPlaceId(decodeURIComponent(match[1])) : null)
      if (match) setFocusRequest((n) => n + 1)
    }
    addEventListener('popstate', handlePopState)
    return () => removeEventListener('popstate', handlePopState)
  }, [])
  // 장소 주소로 바로 들어오면 아래에 지도 기록을 깔아, 뒤로 가기가 사이트를 떠나지 않고 시트만 닫게 한다
  useEffect(() => {
    if (initialPlaceId === null) return
    // 깔아 둔 뒤 새로고침했으면 아래 지도 기록이 이미 있으니 기억만 되살린다
    if (history.state?.[PLACE_ENTRY_KEY]) {
      pushedRef.current = true
      return
    }
    // 같은 커밋의 부모 effect 에서 Next 가 history 를 감싸기 전이라, 다음 틱에 쌓아야 라우터 상태가 붙는다
    const timer = setTimeout(() => {
      if (history.state?.[PLACE_ENTRY_KEY]) return
      const url = location.pathname
      history.replaceState(null, '', mapPath)
      history.pushState(placeEntry(), '', url)
      pushedRef.current = true
    })
    return () => clearTimeout(timer)
  }, [initialPlaceId, mapPath])
  // 빈 곳 탭은 고른 장소가 있으면 고름만 풀고, 없으면 걷어 내기를 켜고 끈다
  const handleEmptyTap = () => {
    if (selectedId !== null) clearSelection()
    else setChromeHidden((hidden) => !hidden)
  }
  // 한 손가락으로 끌면 둘러보기로 보고 시트를 닫는다. 끄는 동안은 숨겨 두었다가 끝날 때 닫아, 고른 장소만큼 넓혀 둔 지도 범위가 끄는 도중에 줄어 튀지 않게 한다
  // 핀치는 고른 장소를 크게 보려는 것이라 시트를 남긴다
  const handleDragChange = (next: boolean, zoomed: boolean) => {
    setDragging(next)
    if (!next && !zoomed && selectedId !== null) clearSelection()
  }
  useEffect(() => {
    dockStowStore.set(chromeHidden)
  }, [chromeHidden])
  // 다른 탭으로 떠나면 도크를 되돌린다
  useEffect(() => () => dockStowStore.set(false), [])
  // 시트는 1단계 높이에 홈 인디케이터 여백을 더해 올라와서, 지도도 그만큼 비켜야 한다
  const safeProbeRef = useRef<HTMLDivElement>(null)
  const [safeBottom, setSafeBottom] = useState(0)
  useEffect(() => {
    setSafeBottom(safeProbeRef.current?.offsetHeight ?? 0)
  }, [])
  // 칩은 폭에 따라 줄 수가 바뀌어서, 그 높이를 재어 지도가 칩 밑 마커를 꺼낼 수 있게 한다
  const filterRef = useRef<HTMLDivElement>(null)
  const [filterHeight, setFilterHeight] = useState(0)
  useEffect(() => {
    const element = filterRef.current
    if (!element) return
    const observer = new ResizeObserver(() => setFilterHeight(element.offsetHeight))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const selected = visiblePlaces.find((place) => place.id === selectedId) ?? null

  return (
    <>
      <div ref={safeProbeRef} aria-hidden className="absolute pb-[env(safe-area-inset-bottom)]" />
      {/* 배경은 비워 페이지의 노을 하늘이 지도 뒤로 보이게 하고, 도크 여백은 되돌려 바닥까지 채우고, isolate 로 Leaflet z-index(400~1000)를 가둬 도크를 위에 둔다 */}
      <div
        data-chrome={chromeHidden ? 'hidden' : undefined}
        className="relative isolate -mb-(--dock-space) h-[calc(100dvh-env(safe-area-inset-top)-var(--spacing)*19)]"
      >
        <CampusMap
          places={visiblePlaces}
          selectedId={selectedId}
          onSelect={select}
          onClear={clearSelection}
          focusRequest={focusRequest}
          topInset={filterHeight}
          bottomInset={PLACE_SHEET_PEEK + safeBottom}
          onDragChange={handleDragChange}
          onEmptyTap={handleEmptyTap}
        />
        {/* Leaflet 판(400~1000) 위에 띄운다. 칩 사이 빈 곳은 지도를 끌 수 있게 누름을 흘려보낸다 */}
        <div
          ref={filterRef}
          className="pointer-events-none absolute inset-x-0 top-0 z-[1000] px-[17px] pt-3 transition-[translate,opacity,visibility] duration-300 ease-out in-data-[chrome=hidden]:invisible in-data-[chrome=hidden]:-translate-y-full in-data-[chrome=hidden]:opacity-0"
        >
          <PlaceFilter selected={filter} onToggle={toggleFilter} onReset={resetFilter} />
        </div>
      </div>
      <PlaceSheet place={selected} hidden={dragging} onClose={clearSelection} />
    </>
  )
}
