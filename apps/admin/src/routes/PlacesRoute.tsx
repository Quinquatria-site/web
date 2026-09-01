import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import { List, ListButtonItem, ListLinkItem } from 'seed-design/ui/list'
import { SegmentedControl, SegmentedControlItem } from 'seed-design/ui/segmented-control'
import { BARS, BOOTHS, TRUCKS } from '../mocks/data'
import styles from './routes.module.css'

const TABS = [
  { value: 'booths', label: '부스' },
  { value: 'bars', label: '주점' },
  { value: 'trucks', label: '푸드트럭' },
]

export function PlacesRoute() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('booths')

  return (
    <div className={styles.page}>
      <div className={styles.inset}>
        <SegmentedControl aria-label="장소 종류" value={tab} onValueChange={setTab}>
          {TABS.map((item) => (
            <SegmentedControlItem key={item.value} value={item.value}>
              {item.label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>

      <List>
        <ListLinkItem
          title="지도에서 위치 확인"
          detail="쓰레기통·의무실 포함"
          onClick={() => navigate('/places/map')}
        />
      </List>

      {tab === 'booths' && (
        <>
          <div className={styles.inset}>
            <ActionButton onClick={() => navigate('/places/booths/new')}>부스 추가</ActionButton>
          </div>
          <List>
            {BOOTHS.map((booth) => (
              <ListButtonItem
                key={booth.id}
                title={booth.name}
                detail={`${booth.spotNumber}번 · ${booth.college} · ${booth.closed ? '마감' : `${booth.opensAt}~${booth.closesAt}`}`}
                onClick={() => navigate(`/places/booths/${booth.id}`)}
              />
            ))}
          </List>
        </>
      )}

      {tab === 'bars' && (
        <>
          <div className={styles.inset}>
            <ActionButton onClick={() => navigate('/places/bars/new')}>주점 추가</ActionButton>
          </div>
          <List>
            {BARS.map((bar) => (
              <ListButtonItem
                key={bar.id}
                title={bar.name}
                detail={`${bar.spotNumber}번 · ${bar.college} · 메뉴 ${bar.menu.length}종`}
                onClick={() => navigate(`/places/bars/${bar.id}`)}
              />
            ))}
          </List>
        </>
      )}

      {tab === 'trucks' && (
        <>
          <div className={styles.inset}>
            <ActionButton onClick={() => navigate('/places/trucks/new')}>
              푸드트럭 추가
            </ActionButton>
          </div>
          <List>
            {TRUCKS.map((truck) => (
              <ListButtonItem
                key={truck.id}
                title={truck.name}
                detail={`${truck.spotNumber}번 · ${truck.closed ? '마감' : `${truck.opensAt}~${truck.closesAt}`}`}
                onClick={() => navigate(`/places/trucks/${truck.id}`)}
              />
            ))}
          </List>
        </>
      )}
    </div>
  )
}
