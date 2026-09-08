'use client'

import { CRS, type Map } from 'leaflet'
import { useEffect, useState } from 'react'
import { ImageOverlay, MapContainer, useMap } from 'react-leaflet'
import { BOOTHS } from '@/mocks/booths'
import {
  boundsFromSource,
  IMAGE_BOUNDS,
  IMAGE_HEIGHT,
  IMAGE_URL,
  IMAGE_WIDTH,
  ZONES,
} from '../libs/campus'
import { BoothMarkers } from './booth-markers'
import { CoordinatePicker } from './coordinate-picker'
import { ZoneTier, type ZoneSelection } from './zone-tier'
import 'leaflet/dist/leaflet.css'

function FitToImage() {
  const map = useMap()

  useEffect(() => {
    const fit = () => {
      const size = map.getSize()
      // 이미지 전체가 들어오는 줌을 직접 계산해 최소 줌으로 잠근다. 줌 1단계 = 2배.
      const zoom = Math.log2(Math.min(size.x / IMAGE_WIDTH, size.y / IMAGE_HEIGHT))
      map.setMinZoom(zoom)
      map.setView(map.getCenter(), zoom)
      map.fitBounds(IMAGE_BOUNDS)
    }
    map.invalidateSize()
    fit()
    map.on('resize', fit)
    return () => {
      map.off('resize', fit)
    }
  }, [map])

  return null
}

export function CampusMap() {
  const [map, setMap] = useState<Map | null>(null)
  const [zone, setZone] = useState<ZoneSelection>('all')

  function moveTo(next: ZoneSelection) {
    setZone(next)
    const found = ZONES.find((candidate) => candidate.id === next)
    // 범위만 주면 줌은 Leaflet 이 계산한다. flyTo 계열이라 부드럽게 이동한다.
    map?.flyToBounds(found ? boundsFromSource(found.rect) : IMAGE_BOUNDS, { padding: [24, 24] })
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        ref={setMap}
        className="h-full w-full bg-surface"
        // 위경도 대신 평면 픽셀 좌표계를 쓴다.
        crs={CRS.Simple}
        bounds={IMAGE_BOUNDS}
        // 드래그가 이미지 밖으로 못 나가게 막는다. viscosity 1 은 경계에서 딱 멈춤.
        maxBounds={IMAGE_BOUNDS}
        maxBoundsViscosity={1}
        maxZoom={2}
        // 줌을 정수 단위가 아니라 자유롭게 허용해 fit 결과가 정확히 맞도록 한다.
        zoomSnap={0}
        zoomControl={false}
        attributionControl={false}
      >
        <ImageOverlay url={IMAGE_URL} bounds={IMAGE_BOUNDS} />
        <FitToImage />
        <BoothMarkers booths={BOOTHS} />
        {process.env.NODE_ENV === 'development' && <CoordinatePicker />}
      </MapContainer>
      <ZoneTier selected={zone} onSelect={moveTo} />
    </div>
  )
}
