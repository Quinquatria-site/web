import { DomEvent, type Map as LeafletMap } from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import { useMap } from 'react-leaflet'
import styles from './CampusMap.module.css'

// 끝 배율에 닿았는지. 둘 다 새 객체라 값이 같아도 다시 그려 최소 배율 변화를 놓치지 않는다
function readLimits(map: LeafletMap) {
  return {
    canZoomIn: map.getZoom() < map.getMaxZoom(),
    canZoomOut: map.getZoom() > map.getMinZoom(),
  }
}

/**
 * 지도 오른쪽 아래 확대·축소 버튼. user 앱 features/map/ZoomButtons.tsx 와 같은 모양·동작이다.
 * 끝 배율에 닿으면 그쪽 버튼을 끈다.
 */
export function ZoomButtons() {
  const map = useMap()
  const ref = useRef<HTMLDivElement>(null)
  const [limits, setLimits] = useState(() => readLimits(map))

  useEffect(() => {
    const element = ref.current
    // 버튼 누름이 지도로 번지면 빈 곳 클릭으로 읽혀 시트가 닫히거나 좌표가 찍힌다
    if (element) DomEvent.disableClickPropagation(element)
    // 화면 크기가 바뀌면 배율은 그대로인데 최소 배율만 바뀌어서 zoomlevelschange 도 듣는다
    const update = () => setLimits(readLimits(map))
    map.on('zoomend zoomlevelschange', update)
    return () => {
      map.off('zoomend zoomlevelschange', update)
    }
  }, [map])

  return (
    <div ref={ref} className={styles.zoom}>
      <button
        type="button"
        aria-label="확대"
        disabled={!limits.canZoomIn}
        onClick={() => map.zoomIn()}
        className={styles.zoomButton}
      >
        +
      </button>
      <button
        type="button"
        aria-label="축소"
        disabled={!limits.canZoomOut}
        onClick={() => map.zoomOut()}
        className={styles.zoomButton}
      >
        -
      </button>
    </div>
  )
}
