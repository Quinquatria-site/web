import type { MapPin } from '../mocks/types'
import styles from './MapPlacer.module.css'

const PIN_LABEL: Record<MapPin['kind'], string> = {
  booth: '부스',
  bar: '주점',
  truck: '푸드트럭',
  trash: '쓰레기통',
  medical: '의무실',
}

export interface MapPlacerProps {
  pins: MapPin[]
  selectedId?: string
  onSelect: (pin: MapPin) => void
}

/**
 * 정적 지도 이미지 위에 좌표로 핀을 얹는다. 외부 지도 API 를 쓰지 않기로 회의에서 정했다.
 * 배경 이미지와 실제 배치는 부스 협의회 이후에 확정되므로 지금은 자리만 잡는다.
 */
export function MapPlacer({ pins, selectedId, onSelect }: MapPlacerProps) {
  return (
    <div className={styles.canvas}>
      <p className={styles.hint}>
        배치도 이미지가 들어갈 자리입니다.
        <br />
        부스 협의회 이후 확정됩니다.
      </p>
      {pins.map((pin) => (
        <button
          key={pin.id}
          type="button"
          className={pin.id === selectedId ? `${styles.pin} ${styles.selected}` : styles.pin}
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          onClick={() => onSelect(pin)}
          aria-label={`${PIN_LABEL[pin.kind]} ${pin.label}`}
        >
          {pin.spotNumber ?? PIN_LABEL[pin.kind]}
        </button>
      ))}
    </div>
  )
}
