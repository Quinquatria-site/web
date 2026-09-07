'use client'

import { useEffect, useState } from 'react'
import { CRS, type Map } from 'leaflet'
import { ImageOverlay, MapContainer, useMap, useMapEvents } from 'react-leaflet'
import {
  IMAGE_BOUNDS,
  IMAGE_HEIGHT,
  IMAGE_URL,
  IMAGE_WIDTH,
  SECTIONS,
  toBounds,
  toLatLng,
} from './campus'
import { SectionButton } from './SectionButton'
import { BoothMarkers } from './BoothMarkers'
import { BOOTHS, type Booth } from './booths'
import { BoothSheet, peekHeight } from './BoothSheet'
import { ZoomControl } from './ZoomControl'

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

function MapClick({ onClick }: { onClick: () => void }) {
  useMapEvents({ click: onClick })
  return null
}

function ZoomWatcher({ onChange }: { onChange: (canIn: boolean, canOut: boolean) => void }) {
  const map = useMapEvents({
    zoomend: () => report(),
    zoomlevelschange: () => report(),
  })
  const report = () =>
    onChange(map.getZoom() < map.getMaxZoom() - 0.01, map.getZoom() > map.getMinZoom() + 0.01)
  useEffect(report)
  return null
}

export function CampusMap() {
  const [map, setMap] = useState<Map | null>(null)
  const [selected, setSelected] = useState<Booth | null>(null)
  const [zoomable, setZoomable] = useState({ in: true, out: true })

  const selectBooth = (booth: Booth) => {
    setSelected(booth)
    if (!map) return
    const size = map.getSize()
    // 시트에 가리지 않도록, 마커가 피크 시트 위쪽에 오게 지도를 위로 민다.
    const limit = size.y - peekHeight(size.y) - 48
    const point = map.latLngToContainerPoint(toLatLng(booth))
    if (point.y > limit) map.panBy([0, point.y - limit])
  }

  const moveTo = (id: (typeof SECTIONS)[number]['id'] | 'all') => {
    if (!map) return
    const section = SECTIONS.find((s) => s.id === id)
    // 범위를 넘기면 줌은 Leaflet 이 계산한다. flyTo 계열은 부드럽게 이동한다.
    map.flyToBounds(section ? toBounds(section.rect) : IMAGE_BOUNDS)
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        ref={setMap}
        className="h-full w-full"
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
        <BoothMarkers booths={BOOTHS} onSelect={selectBooth} />
        <MapClick onClick={() => setSelected(null)} />
        <ZoomWatcher
          onChange={(canIn, canOut) =>
            setZoomable((prev) =>
              prev.in === canIn && prev.out === canOut ? prev : { in: canIn, out: canOut },
            )
          }
        />
      </MapContainer>
      <div className="absolute right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[1000] flex flex-col items-center gap-3">
        <SectionButton sections={SECTIONS} onSelect={moveTo} />
        <ZoomControl
          onZoomIn={() => map?.zoomIn()}
          onZoomOut={() => map?.zoomOut()}
          canZoomIn={zoomable.in}
          canZoomOut={zoomable.out}
        />
      </div>
      <BoothSheet booth={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
