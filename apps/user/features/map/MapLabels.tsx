'use client'

import { divIcon } from 'leaflet'
import { useEffect, useMemo } from 'react'
import { Marker, Pane, useMap } from 'react-leaflet'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { MAP_LABELS, type MapLabel } from './map-labels'
import { toLatLng } from './map-coords'

const LABEL_PANE = 'labels'

// 이미지(overlayPane 400) 위, 장소 마커(markerPane 600) 아래
const LABEL_PANE_Z = 500

// 피그마 글자 56px 을 이미지 픽셀로 옮긴 크기. 지도와 같이 커지고 작아진다
const LABEL_MAP_PX = 19.2

// 전체 보기에선 비례 크기가 5px 대라 못 읽어서, 이 아래로는 줄이지 않는다
const LABEL_MIN_PX = 10

const TONE_CLASS: Record<MapLabel['tone'], string> = {
  light: 'text-text-inverse',
  dark: 'text-text',
}

// 크기 0 인 뿌리에 글자 가운데를 맞춘다. 글자 크기는 LabelScale 이 이름표 pane 에 다는 --label-size 를 따른다
function labelHtml({ tone, rotate = 0 }: MapLabel, text: string) {
  return `<span class="absolute -translate-1/2 font-sans text-(length:--label-size) leading-tight font-semibold tracking-[0.04em] whitespace-pre text-center ${TONE_CLASS[tone]}" style="rotate:${rotate}deg">${text}</span>`
}

// 배율이 바뀔 때마다 이름표 글자 크기를 CSS 변수로 내려 준다. 핀치는 매 프레임 바꾸는데 지도 칸에 걸면 마커까지 전부 스타일을 다시 계산해서, 이름표 pane 에만 건다
function LabelScale() {
  const map = useMap()

  useEffect(() => {
    // Pane 은 pane 요소를 만든 뒤에야 자식을 그려서 여기선 늘 있다
    const pane = map.getPane(LABEL_PANE)
    const update = () => {
      const size = Math.max(LABEL_MIN_PX, LABEL_MAP_PX * map.getZoomScale(map.getZoom(), 0))
      pane?.style.setProperty('--label-size', `${size}px`)
    }
    update()
    map.on('zoom', update)
    return () => {
      map.off('zoom', update)
    }
  }, [map])

  return null
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
      <LabelScale />
      {icons.map(({ label, icon }) => (
        <Marker key={label.key} position={toLatLng(label)} icon={icon} interactive={false} />
      ))}
    </Pane>
  )
}
