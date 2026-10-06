import { Fragment } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { IconChevronRightLine } from '@karrotmarket/react-monochrome-icon'
import { Badge } from '@seed-design/react'
import { List, ListButtonItem, ListDivider } from 'seed-design/ui/list'
import { ListHeader } from 'seed-design/ui/list-header'
import { homeAlerts, type AlertTone, type HomeAlert } from '../lib/homeAlerts'
import { parseAtParam, useNow } from '../lib/useNow'
import { useStoreVersion } from '../store'
import styles from './AlertsRoute.module.css'

const TONE_LABEL: Record<AlertTone, string> = { critical: '오류', warning: '경고' }

/**
 * 홈 칩을 누르면 오는 오류·경고 전체 목록. 여기서도 아무것도 고치지 않는다 —
 * 행을 누르면 고칠 곳으로 간다 (홈과 같은 원칙).
 *
 * 홈의 Callout 을 그대로 옮기지 않고 리스트로 둔다. 여기는 여러 건을 훑어보는
 * 곳이라 색 상자가 쌓이면 홈에서 걷어낸 복잡함이 그대로 옮겨온다. 색은 행 앞
 * 배지 하나로 줄이고, 오류·경고를 섹션으로 갈라 오류가 먼저 읽히게 한다.
 *
 * 계산은 홈 칩과 같은 homeAlerts 다. ?at 도 홈에서 넘겨받아 같은 시각으로 판정한다.
 */
export function AlertsRoute() {
  const [searchParams] = useSearchParams()
  const at = parseAtParam(searchParams.get('at'))
  const now = useNow(at?.getTime() ?? null)

  // 행을 눌러 고치고 돌아왔을 때 그 행이 남아 있으면 고쳐진 건지 알 수 없다
  useStoreVersion()

  const alerts = homeAlerts(now)
  const critical = alerts.filter((alert) => alert.tone === 'critical')
  const warning = alerts.filter((alert) => alert.tone === 'warning')

  return (
    <div className={styles.screen}>
      {alerts.length === 0 ? (
        // 0 건은 나쁜 소식이 아니라 좋은 소식이라 목록 대신 문장으로 말한다
        <section className={styles.section}>
          <p className={styles.emptyTitle}>지금 확인할 것이 없습니다</p>
          <p className={styles.emptyDescription}>문제가 생기면 홈에 칩이 나타납니다.</p>
        </section>
      ) : (
        <>
          {/* 한쪽이 비면 섹션째 뺀다. "오류 0" 섹션은 읽을 것 없이 자리만 차지한다 */}
          {critical.length > 0 && <Section tone="critical" alerts={critical} />}
          {warning.length > 0 && <Section tone="warning" alerts={warning} />}
        </>
      )}
    </div>
  )
}

/**
 * 심각도 하나의 묶음. 홈 Card 와 같은 흰 카드 + boldSolid 헤더 + 우측 건수다.
 * ListHeader 는 li 가 아니라 List(ul) 의 형제로 둔다 — NoticesRoute Section 과 같다.
 */
function Section({ tone, alerts }: { tone: AlertTone; alerts: HomeAlert[] }) {
  const navigate = useNavigate()
  return (
    <section className={styles.section}>
      <ListHeader as="h2" variant="boldSolid">
        <span>{TONE_LABEL[tone]}</span>
        <span className={styles.count}>{alerts.length}</span>
      </ListHeader>
      <List>
        {alerts.map((alert, index) => (
          <Fragment key={alert.key}>
            {/* 행 사이에만 넣는다 — 마지막 행 뒤의 선은 목록이 끊긴 것처럼 보인다 */}
            {index > 0 && <ListDivider inset />}
            <ListButtonItem
              prefix={
                <Badge tone={tone} variant="weak">
                  {TONE_LABEL[tone]}
                </Badge>
              }
              title={alert.title}
              detail={alert.description}
              // 셰브런은 장식이다. 누르는 것은 행 전체다 (홈 RowList 와 같은 관례)
              suffix={
                <span className={styles.chevron} aria-hidden="true">
                  <IconChevronRightLine width={20} height={20} />
                </span>
              }
              onClick={() => navigate(alert.to)}
            />
          </Fragment>
        ))}
      </List>
    </section>
  )
}
