import { divIcon } from 'leaflet'
import { useEffect, useMemo } from 'react'
import { Marker, Pane, useMap } from 'react-leaflet'
import { CAMPUS_LABELS } from './campus-labels'
import { toLatLng } from './campus'
import styles from './CampusMap.module.css'

// 이미지(overlayPane 400) 위, 장소 마커(markerPane 600) 아래
const LABEL_PANE_Z = 500

// user 앱과 같은 값. 피그마 글자 56px 을 이미지 픽셀로 옮긴 크기라 지도와 같이 커지고 작아진다
const LABEL_MAP_PX = 19.2

// 전체 보기에선 비례 크기가 5px 대라 못 읽어서, 이 아래로는 줄이지 않는다
const LABEL_MIN_PX = 10

// 배율이 바뀔 때마다 이름표 글자 크기를 지도 칸 CSS 변수로 내려 준다
function LabelScale() {
  const map = useMap()

  useEffect(() => {
    const update = () => {
      const size = Math.max(LABEL_MIN_PX, LABEL_MAP_PX * map.getZoomScale(map.getZoom(), 0))
      map.getContainer().style.setProperty('--label-size', `${size}px`)
    }
    update()
    map.on('zoom', update)
    return () => {
      map.off('zoom', update)
    }
  }, [map])

  return null
}

/** 건물·광장 이름표. user 지도와 같은 자리·모양이라 운영자가 학생 화면과 같은 지도를 본다 */
export function CampusLabels() {
  const icons = useMemo(
    () =>
      CAMPUS_LABELS.map((label) => ({
        label,
        icon: divIcon({
          html: `<span class="${styles.label} ${styles[label.tone]}" style="rotate:${label.rotate ?? 0}deg">${label.text}</span>`,
          className: '',
          iconSize: [0, 0],
        }),
      })),
    [],
  )

  return (
    <Pane name="labels" style={{ zIndex: LABEL_PANE_Z }}>
      <LabelScale />
      {icons.map(({ label, icon }) => (
        <Marker key={label.text} position={toLatLng(label)} icon={icon} interactive={false} />
      ))}
    </Pane>
  )
}
