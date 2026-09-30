'use client'

import { CRS } from 'leaflet'
import { useEffect } from 'react'
import { ImageOverlay, MapContainer, useMap } from 'react-leaflet'
import { MAP_BOUNDS, MAP_HEIGHT, MAP_IMAGE_URL, MAP_WIDTH } from './map-coords'
import { MapLabels } from './MapLabels'
import 'leaflet/dist/leaflet.css'

// 이미지 1px 이 화면 2px 까지 커진다. 그 이상은 흐려진다
const MAX_ZOOM = 1

// 기본 최소 배율 0 이 전체 맞춤 계산까지 잘라 먹어서, 계산 전에는 충분히 낮춰 둔다
const FLOOR_ZOOM = -5

// 처음엔 캠퍼스 전체가 화면에 들어오게 두고, 그보다 작아지지 않게 막는다
function FitCampus() {
  const map = useMap()

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
      map.setMaxBounds([
        [-padY, -padX],
        [MAP_HEIGHT + padY, MAP_WIDTH + padX],
      ])
    }
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

/** 캠퍼스 지도. 이미지 한 장을 픽셀 좌표(CRS.Simple)로 깔고 끌기·확대만 받는다 */
export default function CampusMap() {
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
      <FitCampus />
      <TrackpadPinchZoom />
    </MapContainer>
  )
}
