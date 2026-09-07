'use client'

import { useEffect } from 'react'
import { divIcon } from 'leaflet'
import { Marker, useMap, useMapEvents } from 'react-leaflet'
import { toLatLng } from './campus'
import type { Booth } from './booths'

const LABEL_ZOOM = 1

type Props = {
  booths: Booth[]
  onSelect?: (booth: Booth) => void
}

function boothIcon(number: number) {
  // divIcon 은 HTML 로 마커를 그린다. Leaflet 이 바깥 요소의 transform 으로 위치를 잡으므로 크기 조절은 안쪽 요소에 건다.
  return divIcon({
    className: 'booth-marker',
    html: `<span class="booth-marker__body"><span class="booth-marker__label">${number}</span></span>`,
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

export function BoothMarkers({ booths, onSelect }: Props) {
  return (
    <>
      <OverviewClass />
      {booths.map((booth) => (
        <Marker
          key={booth.id}
          position={toLatLng(booth)}
          icon={boothIcon(booth.number)}
          eventHandlers={{ click: () => onSelect?.(booth) }}
        />
      ))}
    </>
  )
}
