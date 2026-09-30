'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MapPlace, PlaceCode } from './map-place'
import { PlaceFilter } from './PlaceFilter'
import { PLACE_SHEET_PEEK, PlaceSheet } from './PlaceSheet'

// Leaflet 은 불러오는 순간 window 를 읽어서 빌드 때 굽지 않고 브라우저에서만 싣는다
const CampusMap = dynamic(() => import('./CampusMap'), { ssr: false })

/** 머리 아래 남은 화면을 지도로 채운다. 도크는 지도 위에 떠 있고, 고른 장소와 그 시트는 여기서 들고 있다 */
export function MapView({ places }: { places: MapPlace[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
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
  const select = useCallback((id: number) => {
    setSelectedId(id)
    setFocusRequest((n) => n + 1)
  }, [])
  const clearSelection = useCallback(() => setSelectedId(null), [])
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
      {/* 배경은 이미지 가장자리 색(경계 숨김), 도크 여백은 되돌려 바닥까지 채우고, isolate 로 Leaflet z-index(400~1000)를 가둬 도크를 위에 둔다 */}
      <div className="relative isolate bg-[#fefaf2] -mb-(--dock-space) h-[calc(100dvh-env(safe-area-inset-top)-var(--spacing)*19)]">
        <CampusMap
          places={visiblePlaces}
          selectedId={selectedId}
          onSelect={select}
          onClear={clearSelection}
          focusRequest={focusRequest}
          topInset={filterHeight}
          bottomInset={PLACE_SHEET_PEEK + safeBottom}
          onDragChange={setDragging}
        />
        {/* Leaflet 판(400~1000) 위에 띄운다. 칩 사이 빈 곳은 지도를 끌 수 있게 누름을 흘려보낸다 */}
        <div
          ref={filterRef}
          className="pointer-events-none absolute inset-x-0 top-0 z-[1000] px-[17px] pt-3"
        >
          <PlaceFilter selected={filter} onToggle={toggleFilter} onReset={resetFilter} />
        </div>
      </div>
      <PlaceSheet place={selected} hidden={dragging} onClose={clearSelection} />
    </>
  )
}
