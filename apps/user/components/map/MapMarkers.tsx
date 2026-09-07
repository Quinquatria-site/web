'use client'

import { useEffect } from 'react'
import { divIcon } from 'leaflet'
import { Marker, useMap, useMapEvents } from 'react-leaflet'
import { toLatLng } from './campus'
import { markerLabel, type MapItem } from './items'

const LABEL_ZOOM = 1

type Props = {
  items: MapItem[]
  onSelect?: (item: MapItem) => void
}

function markerIcon(item: MapItem) {
  // divIcon 은 HTML 로 마커를 그린다. Leaflet 이 바깥 요소의 transform 으로 위치를 잡으므로 크기 조절은 안쪽 요소에 건다.
  return divIcon({
    className: `map-marker map-marker--${item.kind}`,
    html: `<span class="map-marker__body"><span class="map-marker__label">${markerLabel(item)}</span></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

function OverviewClass() {
  const map = useMap()
  const apply = () => {
    // 기준 줌보다 작으면 컨테이너에 클래스를 붙이고, 마커 모양은 CSS 가 바꾼다.
    map.getContainer().classList.toggle('is-overview', map.getZoom() < LABEL_ZOOM)
  }
  useMapEvents({ zoomend: apply })
  useEffect(apply)
  return null
}

export function MapMarkers({ items, onSelect }: Props) {
  return (
    <>
      <OverviewClass />
      {items.map((item) => (
        <Marker
          key={item.id}
          position={toLatLng(item)}
          icon={markerIcon(item)}
          eventHandlers={{ click: () => onSelect?.(item) }}
        />
      ))}
    </>
  )
}
