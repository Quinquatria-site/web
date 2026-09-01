import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import { Callout } from 'seed-design/ui/callout'
import { List, ListSwitchItem } from 'seed-design/ui/list'
import { Switchmark } from 'seed-design/ui/switch'
import { ListHeader } from 'seed-design/ui/list-header'
import { BARS, BOOTHS, NOTICES, PERFORMANCES, TRUCKS } from '../mocks/data'
import styles from './routes.module.css'

/** 축제 당일 현장에서 폰으로 쓰는 운영 보드 */
export function HomeRoute() {
  const navigate = useNavigate()
  const [booths, setBooths] = useState(BOOTHS)

  const nowPlaying = PERFORMANCES[1]
  const urgentDraft = NOTICES.find((notice) => notice.urgent && !notice.published)
  const openCount = booths.filter((booth) => !booth.closed).length
  const barOpenCount = BARS.filter((bar) => !bar.closed).length
  const truckOpenCount = TRUCKS.filter((truck) => !truck.closed).length

  const toggle = (id: string) =>
    setBooths((prev) =>
      prev.map((booth) => (booth.id === id ? { ...booth, closed: !booth.closed } : booth)),
    )

  return (
    <div className={styles.page}>
      <div className={styles.inset}>
        <Callout
          title={`지금 공연 중 · ${nowPlaying.stage}`}
          description={`${nowPlaying.artist} (${nowPlaying.startsAt}~${nowPlaying.endsAt})`}
        />
      </div>

      <div className={styles.stat}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>
            {openCount}/{booths.length}
          </span>
          <span className={styles.statLabel}>부스 운영 중</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>
            {barOpenCount}/{BARS.length}
          </span>
          <span className={styles.statLabel}>주점 운영 중</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>
            {truckOpenCount}/{TRUCKS.length}
          </span>
          <span className={styles.statLabel}>푸드트럭</span>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>긴급 공지</h2>
        <div className={styles.inset}>
          {urgentDraft ? (
            <Callout
              title={`발행 대기 · ${urgentDraft.title}`}
              description="아직 게시되지 않았습니다. 발행하면 사용자 화면에 팝업으로 뜹니다."
            />
          ) : (
            <p className={styles.muted}>대기 중인 긴급 공지가 없습니다.</p>
          )}
          <div style={{ marginTop: 'var(--seed-dimension-x3)' }}>
            <ActionButton onClick={() => navigate('/notices/new')}>긴급 공지 작성</ActionButton>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <ListHeader as="h2">부스 마감 처리</ListHeader>
        <List>
          {booths.map((booth) => (
            <ListSwitchItem
              key={booth.id}
              title={booth.name}
              detail={`${booth.spotNumber}번 · ${booth.opensAt}~${booth.closesAt}`}
              checked={booth.closed}
              onCheckedChange={() => toggle(booth.id)}
              suffix={<Switchmark />}
            />
          ))}
        </List>
      </div>
    </div>
  )
}
