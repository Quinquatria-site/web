'use client'

import { divIcon } from 'leaflet'
import { useMemo } from 'react'
import { Marker, Pane } from 'react-leaflet'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { MAP_LABELS, type MapLabel } from './map-labels'
import { toLatLng } from './map-coords'

const LABEL_PANE = 'labels'

// 이미지(overlayPane 400) 위, 장소 마커(markerPane 600) 아래
const LABEL_PANE_Z = 500

const TONE_CLASS: Record<MapLabel['tone'], string> = {
  light: 'text-text-inverse',
  dark: 'text-text',
}

// 크기 0 인 뿌리에 글자 가운데를 맞춘다. 배율마다 글자를 다시 그리지 않게 크기는 12 로 고정한다
function labelHtml({ tone, rotate = 0 }: MapLabel, text: string) {
  return `<span class="absolute -translate-1/2 font-sans text-xs leading-tight font-bold tracking-[0.04em] whitespace-pre text-center ${TONE_CLASS[tone]}" style="rotate:${rotate}deg">${text}</span>`
}

/** 건물·광장 이름표. 바탕 이미지에 굽지 않고 글자로 올려 확대해도 선명하고 언어를 따른다 */
export function MapLabels() {
  const labels = getMessages(useLocale()).map.labels
  const icons = useMemo(
    () =>
      MAP_LABELS.map((label) => ({
        label,
        icon: divIcon({
          html: labelHtml(label, labels[label.key]),
          className: '',
          iconSize: [0, 0],
        }),
      })),
    [labels],
  )

  return (
    <Pane name={LABEL_PANE} style={{ zIndex: LABEL_PANE_Z }}>
      {icons.map(({ label, icon }) => (
        <Marker key={label.key} position={toLatLng(label)} icon={icon} interactive={false} />
      ))}
    </Pane>
  )
}
