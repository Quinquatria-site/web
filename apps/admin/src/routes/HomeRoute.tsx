import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import { Callout } from 'seed-design/ui/callout'
import { List, ListSwitchItem } from 'seed-design/ui/list'
import { Snackbar, useSnackbarAdapter } from 'seed-design/ui/snackbar'
import { Switchmark } from 'seed-design/ui/switch'
import { ListHeader } from 'seed-design/ui/list-header'
import { BARS, BOOTHS, NOTICES, PERFORMANCES, TRUCKS } from '../mocks/data'
import styles from './routes.module.css'

/** 축제 당일 현장에서 폰으로 쓰는 운영 보드 */
export function HomeRoute() {
  const navigate = useNavigate()
  const snackbar = useSnackbarAdapter()
  const [booths, setBooths] = useState(BOOTHS)
  const [pending, setPending] = useState<string | undefined>(undefined)

  const nowPlaying = PERFORMANCES[1]
  const urgentDraft = NOTICES.find((notice) => notice.urgent && !notice.published)
  const openCount = booths.filter((booth) => !booth.closed).length
  const barOpenCount = BARS.filter((bar) => !bar.closed).length
  const truckOpenCount = TRUCKS.filter((truck) => !truck.closed).length

  const setClosed = (id: string, closed: boolean) =>
    setBooths((prev) => prev.map((booth) => (booth.id === id ? { ...booth, closed } : booth)))

  /**
   * 토글은 자동 저장이 정석이다. 확인 다이얼로그를 두면 현장에서 한 손으로 누를 때
   * 오조작보다 조작 실패가 더 많이 난다. 안전장치는 확인이 아니라 실행취소다.
   * 낙관적으로 먼저 반영하고, 요청 중에는 그 스위치만 잠가 연타를 막는다.
   * 실패 시 롤백과 재시도 토스트는 실제 API 를 붙일 때 같이 넣는다.
   */
  const toggle = async (id: string, next: boolean) => {
    setClosed(id, next)
    setPending(id)
    await new Promise((resolve) => setTimeout(resolve, 400))
    setPending(undefined)

    const name = booths.find((booth) => booth.id === id)?.name ?? ''
    snackbar.create({
      timeout: 5000,
      render: () => (
        <Snackbar
          message={`${name} ${next ? '마감했습니다' : '마감을 풀었습니다'}`}
          actionLabel="실행취소"
          onAction={() => setClosed(id, !next)}
        />
      ),
    })
  }

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
              disabled={pending === booth.id}
              onCheckedChange={(next) => void toggle(booth.id, next)}
              suffix={<Switchmark />}
            />
          ))}
        </List>
      </div>
    </div>
  )
}
