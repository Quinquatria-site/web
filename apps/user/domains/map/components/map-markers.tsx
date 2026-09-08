'use client'

import { divIcon } from 'leaflet'
import { useState } from 'react'
import { Marker, useMap, useMapEvents } from 'react-leaflet'
import { fromSource, toLatLng } from '../libs/campus'
import { markerLabel, type MapItem } from '../libs/items'

// 이 줌보다 작으면 글자를 숨기고 점으로만 찍는다
const LABEL_ZOOM = 0.4

// 색 하나로 구분하지 않고 모양과 채움을 함께 바꾼다. 흑백으로 봐도 갈린다.
const SHAPE: Record<MapItem['kind'], string> = {
  booth: 'border-radius:9999px;background:var(--color-accent);color:var(--color-accent-ink)',
  pub: 'border-radius:7px;background:var(--color-ink);color:var(--color-surface)',
  aid: 'border-radius:9999px;background:var(--color-surface);color:var(--color-accent)',
}

function icon(item: MapItem, compact: boolean) {
  const size = compact ? 10 : 24
  const html = compact
    ? `<span style="display:block;width:10px;height:10px;${SHAPE[item.kind]};border:1.5px solid var(--color-accent-ink)"></span>`
    : `<span style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;${SHAPE[item.kind]};border:1.5px solid var(--color-accent-ink);font-size:11px;font-weight:600;line-height:1">${markerLabel(item)}</span>`

  return divIcon({ className: '', html, iconSize: [size, size], iconAnchor: [size / 2, size / 2] })
}

export function MapMarkers({
  items,
  onSelect,
}: {
  items: MapItem[]
  onSelect?: (item: MapItem) => void
}) {
  const map = useMap()
  // 줌이 기준선을 넘을 때만 상태가 뒤집혀, 마커가 그때 한 번 다시 그려진다
  const [compact, setCompact] = useState(() => map.getZoom() < LABEL_ZOOM)
  useMapEvents({ zoomend: () => setCompact(map.getZoom() < LABEL_ZOOM) })

  return (
    <>
      {items.map((item) => (
        <Marker
          key={item.id}
          position={toLatLng(fromSource(item))}
          icon={icon(item, compact)}
          eventHandlers={{ click: () => onSelect?.(item) }}
        />
      ))}
    </>
  )
}
