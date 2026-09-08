'use client'

import { divIcon } from 'leaflet'
import { useState } from 'react'
import { Marker, useMap, useMapEvents } from 'react-leaflet'
import type { Booth } from '@/mocks/booths'
import { fromSource, toLatLng } from '../libs/campus'

// 이 줌보다 작으면 번호를 숨기고 점으로만 찍는다
const LABEL_ZOOM = 0.4

function icon(booth: Booth, compact: boolean) {
  // divIcon 은 HTML 로 마커를 그린다. Leaflet 이 바깥 요소의 위치를 잡으므로 크기는 안쪽에서 정한다.
  const size = compact ? 10 : 24
  const html = compact
    ? `<span style="display:block;width:10px;height:10px;border-radius:9999px;background:var(--color-accent);border:1.5px solid var(--color-accent-ink)"></span>`
    : `<span style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:9999px;background:var(--color-accent);color:var(--color-accent-ink);border:1.5px solid var(--color-accent-ink);font-size:11px;font-weight:600;line-height:1">${booth.number}</span>`

  return divIcon({ className: '', html, iconSize: [size, size], iconAnchor: [size / 2, size / 2] })
}

export function BoothMarkers({
  booths,
  onSelect,
}: {
  booths: Booth[]
  onSelect?: (booth: Booth) => void
}) {
  const map = useMap()
  // 줌이 기준선을 넘을 때만 상태가 뒤집혀, 마커가 그때 한 번 다시 그려진다
  const [compact, setCompact] = useState(() => map.getZoom() < LABEL_ZOOM)
  useMapEvents({ zoomend: () => setCompact(map.getZoom() < LABEL_ZOOM) })

  return (
    <>
      {booths.map((booth) => (
        <Marker
          key={booth.id}
          position={toLatLng(fromSource(booth))}
          icon={icon(booth, compact)}
          eventHandlers={{ click: () => onSelect?.(booth) }}
        />
      ))}
    </>
  )
}
