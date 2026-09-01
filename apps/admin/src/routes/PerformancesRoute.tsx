import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import { Callout } from 'seed-design/ui/callout'
import { List, ListButtonItem } from 'seed-design/ui/list'
import { SegmentedControl, SegmentedControlItem } from 'seed-design/ui/segmented-control'
import { PERFORMANCES } from '../mocks/data'
import type { PerformanceKind } from '../mocks/types'
import styles from './routes.module.css'

export function PerformancesRoute() {
  const navigate = useNavigate()
  const [kind, setKind] = useState<string>('celebrity')

  const list = PERFORMANCES.filter((item) => item.kind === (kind as PerformanceKind))

  return (
    <div className={styles.page}>
      <div className={styles.inset}>
        <SegmentedControl aria-label="공연 종류" value={kind} onValueChange={setKind}>
          <SegmentedControlItem value="celebrity">연예인</SegmentedControlItem>
          <SegmentedControlItem value="student">학우</SegmentedControlItem>
        </SegmentedControl>
      </div>

      {kind === 'celebrity' && (
        <div className={styles.inset}>
          <Callout description="라인업은 인스타 공개 시점에 맞춰 입력합니다. 그 전에는 비공개로 둡니다." />
        </div>
      )}

      <div className={styles.inset}>
        <ActionButton onClick={() => navigate('/performances/new')}>공연 추가</ActionButton>
      </div>

      {list.length === 0 ? (
        <p className={styles.empty}>등록된 공연이 없습니다</p>
      ) : (
        <List>
          {list.map((item) => (
            <ListButtonItem
              key={item.id}
              title={item.artist}
              detail={`${item.startsAt}~${item.endsAt} · ${item.stage}`}
              onClick={() => navigate(`/performances/${item.id}`)}
            />
          ))}
        </List>
      )}
    </div>
  )
}
