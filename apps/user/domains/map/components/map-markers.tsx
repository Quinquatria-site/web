'use client'

import { divIcon } from 'leaflet'
import { useState } from 'react'
import { Marker, useMap, useMapEvents } from 'react-leaflet'
import { useLang } from '@/components/lang-provider'
import { fromSource, toLatLng } from '../libs/campus'
import { itemLabel, type MapItem } from '../libs/items'
import { markerHtml, markerSize } from '../libs/markers'

// 이 줌보다 작으면 글자와 아이콘을 숨기고 실루엣만 남긴다
const LABEL_ZOOM = 0.4

function icon(item: MapItem, compact: boolean) {
  const [width, height] = markerSize(item.kind, compact)
  return divIcon({
    className: '',
    html: markerHtml(item.kind, compact, item.kind === 'booth' ? String(item.number) : undefined),
    iconSize: [width, height],
    iconAnchor: [width / 2, height / 2],
  })
}

export function MapMarkers({
  items,
  onSelect,
}: {
  items: MapItem[]
  onSelect?: (item: MapItem) => void
}) {
  const { lang, copy } = useLang()
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
          title={itemLabel(item, copy, lang)}
          eventHandlers={{ click: () => onSelect?.(item) }}
        />
      ))}
    </>
  )
}
