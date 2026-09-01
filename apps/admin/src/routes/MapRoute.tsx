import { useState } from 'react'
import { Callout } from 'seed-design/ui/callout'
import { List, ListItem } from 'seed-design/ui/list'
import { ListHeader } from 'seed-design/ui/list-header'
import { MapPlacer } from '../components/MapPlacer'
import { MAP_PINS } from '../mocks/data'
import type { MapPin } from '../mocks/types'
import styles from './routes.module.css'

const KIND_LABEL: Record<MapPin['kind'], string> = {
  booth: '부스',
  bar: '주점',
  truck: '푸드트럭',
  trash: '쓰레기통',
  medical: '의무실',
}

export function MapRoute() {
  const [selected, setSelected] = useState<MapPin | undefined>(undefined)

  return (
    <div className={styles.page}>
      <div className={styles.inset}>
        <MapPlacer pins={MAP_PINS} selectedId={selected?.id} onSelect={setSelected} />
      </div>

      <div className={styles.inset}>
        {selected ? (
          <Callout
            title={`${KIND_LABEL[selected.kind]} · ${selected.label}`}
            description={
              selected.spotNumber ? `${selected.spotNumber}번 자리` : '자리 번호가 없는 시설입니다'
            }
          />
        ) : (
          <p className={styles.muted}>핀을 눌러 어떤 장소인지 확인하세요.</p>
        )}
      </div>

      <div className={styles.section}>
        <ListHeader as="h2">배치된 핀</ListHeader>
        <List>
          {MAP_PINS.map((pin) => (
            <ListItem
              key={pin.id}
              title={pin.label}
              detail={KIND_LABEL[pin.kind]}
              suffix={pin.spotNumber ? `${pin.spotNumber}번` : undefined}
            />
          ))}
        </List>
      </div>
    </div>
  )
}
