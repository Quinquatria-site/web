'use client'

import { useEffect } from 'react'
import { CRS, type LatLngBoundsExpression } from 'leaflet'
import { ImageOverlay, MapContainer, useMap } from 'react-leaflet'

const IMAGE_URL = '/campus.svg'
const IMAGE_WIDTH = 390
const IMAGE_HEIGHT = 329

// 이미지 픽셀을 그대로 좌표로 쓴다. [[y, x]] 순서이고 원점은 좌하단.
const IMAGE_BOUNDS: LatLngBoundsExpression = [
  [0, 0],
  [IMAGE_HEIGHT, IMAGE_WIDTH],
]

function FitToImage({ width, height }: { width: number; height: number }) {
  const map = useMap()

  useEffect(() => {
    const bounds: LatLngBoundsExpression = [
      [0, 0],
      [height, width],
    ]
    const fit = () => {
      const size = map.getSize()
      // 이미지 전체가 들어오는 줌을 직접 계산해 최소 줌으로 잠근다. 줌 1단계 = 2배.
      const zoom = Math.log2(Math.min(size.x / width, size.y / height))
      map.setMinZoom(zoom)
      map.setView(map.getCenter(), zoom)
      map.fitBounds(bounds)
    }
    map.invalidateSize()
    fit()
    map.on('resize', fit)
    return () => {
      map.off('resize', fit)
    }
  }, [map, width, height])

  return null
}

export function CampusMap() {
  return (
    <MapContainer
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
      <FitToImage width={IMAGE_WIDTH} height={IMAGE_HEIGHT} />
    </MapContainer>
  )
}
