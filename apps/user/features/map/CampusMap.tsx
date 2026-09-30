'use client'

import { CRS } from 'leaflet'
import { useEffect, useRef } from 'react'
import { ImageOverlay, MapContainer, useMap, useMapEvents } from 'react-leaflet'
import {
  MAP_BOUNDS,
  MAP_HEIGHT,
  MAP_IMAGE_URL,
  MAP_WIDTH,
  type MapPoint,
  toLatLng,
} from './map-coords'
import { MapLabels } from './MapLabels'
import type { MapPlace } from './map-place'
import { FULL_MARKER_ZOOM, PlaceMarkers } from './PlaceMarkers'
import { ZoomButtons } from './ZoomButtons'
import 'leaflet/dist/leaflet.css'

// 이미지 1px 이 화면 2px 까지 커진다. 그 이상은 흐려진다
const MAX_ZOOM = 1

// 기본 최소 배율 0 이 전체 맞춤 계산까지 잘라 먹어서, 계산 전에는 충분히 낮춰 둔다
const FLOOR_ZOOM = -5

// 처음엔 캠퍼스 전체가 화면에 들어오게 두고, 그보다 작아지지 않게 막는다. 위아래를 가린 높이만큼은 더 밀 수 있게 열어 둔다
function FitCampus({ topInset, bottomInset }: { topInset: number; bottomInset: number }) {
  const map = useMap()
  const insetRef = useRef({ top: topInset, bottom: bottomInset })
  const lockRef = useRef<() => void>(undefined)

  useEffect(() => {
    const fit = () => {
      map.setMinZoom(FLOOR_ZOOM)
      map.setMinZoom(map.getBoundsZoom(MAP_BOUNDS))
    }
    // 화면보다 작은 방향은 Leaflet 이 이미지가 화면 안에 머무는 만큼 끌게 두고 손을 떼야 되돌려서, 범위를 화면 크기로 넓혀 아예 못 움직이게 한다
    const lockShortAxis = () => {
      const { x, y } = map.getSize()
      const scale = map.getZoomScale(map.getZoom(), 0)
      const padX = Math.max(0, (x / scale - MAP_WIDTH) / 2)
      const padY = Math.max(0, (y / scale - MAP_HEIGHT) / 2)
      // 시트가 아래를 가리는 동안은 그 높이만큼 지도를 위로 올릴 수 있어야 아래쪽 장소가 시트 위로 나온다
      // 위는 칩이 늘 가리는데, 전체 보기처럼 지도 위에 빈 곳이 이미 있으면 잠금을 풀지 않도록 모자란 만큼만 연다
      map.setMaxBounds([
        [-padY - insetRef.current.bottom / scale, -padX],
        [MAP_HEIGHT + Math.max(padY, insetRef.current.top / scale), MAP_WIDTH + padX],
      ])
    }
    lockRef.current = lockShortAxis
    fit()
    map.setView([MAP_HEIGHT / 2, MAP_WIDTH / 2], map.getMinZoom(), { animate: false })
    lockShortAxis()
    map.on('resize', fit)
    map.on('zoomend resize', lockShortAxis)
    return () => {
      map.off('resize', fit)
      map.off('zoomend resize', lockShortAxis)
    }
  }, [map])

  useEffect(() => {
    insetRef.current = { top: topInset, bottom: bottomInset }
    lockRef.current?.()
  }, [topInset, bottomInset])

  return null
}

// 핀치 휠 1px 당 확대 단계. 120px 쯤 벌리면 두 배가 된다
const PINCH_ZOOM_PER_PX = 0.01

// 트랙패드 핀치는 ctrlKey 붙은 작은 휠로 들어와 Leaflet 기본(60px 당 1단계·40ms 묶음)으로는 거의 안 커져서 따로 받는다
function TrackpadPinchZoom() {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return
      // capture 에서 멈춰 Leaflet 휠 확대와 브라우저 페이지 확대가 겹치지 않게 한다
      event.preventDefault()
      event.stopPropagation()
      map.setZoomAround(
        map.mouseEventToContainerPoint(event),
        map.getZoom() - event.deltaY * PINCH_ZOOM_PER_PX,
        { animate: false },
      )
    }
    container.addEventListener('wheel', handleWheel, { capture: true, passive: false })
    return () => container.removeEventListener('wheel', handleWheel, { capture: true })
  }, [map])

  return null
}

// 고른 장소를 위 칩과 아래 시트 사이 남은 화면 가운데로 옮긴다. 점으로 보이는 배율이면 큰 마커가 보일 때까지 확대한다
function FocusPlace({
  point,
  request,
  topInset,
  bottomInset,
}: {
  point: MapPoint | null
  request: number
  topInset: number
  bottomInset: number
}) {
  const map = useMap()
  const zoomingRef = useRef(false)
  const pendingRef = useRef<() => void>(undefined)

  // 확대 전환 중에 다시 옮기면 끝날 때 이전 자리로 돌아가서, 전환이 끝난 뒤 마지막 요청만 옮긴다
  useEffect(() => {
    const start = () => {
      zoomingRef.current = true
    }
    const end = () => {
      zoomingRef.current = false
      const pending = pendingRef.current
      pendingRef.current = undefined
      pending?.()
    }
    map.on('zoomstart', start)
    map.on('zoomend', end)
    return () => {
      map.off('zoomstart', start)
      map.off('zoomend', end)
    }
  }, [map])

  useEffect(() => {
    pendingRef.current = undefined
    if (!point) return
    const focus = () => {
      const zoom = Math.max(map.getZoom(), FULL_MARKER_ZOOM)
      // 칩과 시트 사이 가운데에 오도록, 두 높이 차의 절반만큼 중심을 아래로 잡는다
      const center = map.project(toLatLng(point), zoom).add([0, (bottomInset - topInset) / 2])
      map.setView(map.unproject(center, zoom), zoom)
    }
    if (zoomingRef.current) pendingRef.current = focus
    else focus()
    // request 는 같은 장소를 다시 눌러도 다시 옮기려고 받는다
  }, [map, point, request, topInset, bottomInset])

  return null
}

// 손으로 지도를 끄는 동안을 알린다. 시트가 그동안 아래로 비켜 지도를 가리지 않는다
function DragWatch({ onDragChange }: { onDragChange: (dragging: boolean) => void }) {
  useMapEvents({
    dragstart: () => onDragChange(true),
    dragend: () => onDragChange(false),
  })
  return null
}

/** 캠퍼스 지도. 이미지 한 장을 픽셀 좌표(CRS.Simple)로 깔고 끌기·확대를 받으며, 장소 마커를 올린다 */
export default function CampusMap({
  places,
  selectedId,
  onSelect,
  onClear,
  focusRequest,
  topInset,
  bottomInset,
  onDragChange,
}: {
  places: MapPlace[]
  selectedId: number | null
  onSelect: (id: number) => void
  onClear: () => void
  /** 마커를 누를 때마다 늘어나는 수. 같은 장소를 다시 눌러도 다시 옮긴다 */
  focusRequest: number
  /** 지도 위를 늘 가리는 칩 층 높이 */
  topInset: number
  /** 장소를 고른 동안 아래를 가리는 높이. 고른 장소를 이만큼 위로 비켜 둔다 */
  bottomInset: number
  onDragChange: (dragging: boolean) => void
}) {
  const selected = places.find((place) => place.id === selectedId) ?? null

  return (
    <MapContainer
      crs={CRS.Simple}
      bounds={MAP_BOUNDS}
      maxBoundsViscosity={1}
      maxZoom={MAX_ZOOM}
      zoomSnap={0}
      zoomControl={false}
      attributionControl={false}
      // 배경은 MapView 가 칠한다. leaflet.css 의 #ddd 가 뒤에 실려 ! 로 지운다
      className="size-full bg-transparent!"
    >
      <ImageOverlay url={MAP_IMAGE_URL} bounds={MAP_BOUNDS} />
      <MapLabels />
      <FitCampus topInset={topInset} bottomInset={selected ? bottomInset : 0} />
      <TrackpadPinchZoom />
      <PlaceMarkers places={places} selectedId={selectedId} onSelect={onSelect} onClear={onClear} />
      <FocusPlace
        point={selected}
        request={focusRequest}
        topInset={topInset}
        bottomInset={bottomInset}
      />
      <DragWatch onDragChange={onDragChange} />
      <ZoomButtons />
    </MapContainer>
  )
}
