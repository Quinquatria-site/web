import { ActionButton } from 'seed-design/ui/action-button'
import type { HealthResult } from '../../api'
import { kstTimeString } from '../../lib/festivalTime'
import { useHealth } from '../../lib/useHealth'
import styles from './StatusStrip.module.css'

/**
 * API 서버가 떠 있는지 한 줄로. 홈 맨 위, 경고보다 앞에 둔다.
 *
 * 경고 묶음(`.warnings`)에 넣지 않는다. 거기는 **데이터가 잘못됐다** 는
 * 말만 하는 자리이고 누르면 고치러 가는 곳이 있다. 서버가 죽은 것은 운영자가
 * 화면에서 고칠 수 있는 일이 아니라 성격이 다르다.
 *
 * 그래서 평소에는 조용하다 — 회색 작은 글씨 한 줄이고, 문제가 있을 때만
 * 빨강과 버튼이 나타난다. 상황판 맨 위에 늘 켜져 있는 경고는 며칠 지나면
 * 아무도 안 읽는다.
 */

interface ServerRow {
  key: string
  name: string
  result: HealthResult | null
}

/** 확인 전(null)과 미설정은 모두 "아직 모른다" 쪽이라 조용한 색이다 */
function isBad(result: HealthResult | null): boolean {
  return result?.state === 'down' || result?.state === 'error'
}

function stateLabel(result: HealthResult | null): string {
  if (!result) return '확인 중'
  switch (result.state) {
    case 'ok':
      // ms 를 붙이는 것은 "떠 있다" 와 "쓸 만하다" 가 다르기 때문이다.
      // 3초짜리 응답은 살아 있어도 편집이 안 된다
      return result.durationMs === undefined ? '정상' : `정상 ${result.durationMs}ms`
    case 'error':
      return `오류 ${result.status ?? ''}`.trim()
    case 'down':
      return '응답 없음'
    case 'unconfigured':
      return '주소 미설정'
  }
}

export function StatusStrip() {
  const { backoffice, customer, checkedAt, checking, refresh } = useHealth()

  const servers: ServerRow[] = [
    { key: 'backoffice', name: '백오피스', result: backoffice },
    { key: 'customer', name: '학생 API', result: customer },
  ]

  // 아직 둘 다 주소가 없으면 배포 화면에 영구적인 회색 줄이 남는다. 그건
  // 운영자에게 아무 뜻도 없는 문장이라, 주소를 채워야 할 개발 중에만 보인다
  const allUnconfigured = servers.every((server) => server.result?.state === 'unconfigured')
  if (allUnconfigured && !import.meta.env.DEV) return null

  const hasProblem = servers.some((server) => isBad(server.result))

  return (
    <div className={styles.strip}>
      {servers.map((server) => (
        <span key={server.key} className={styles.item}>
          <span
            className={isBad(server.result) ? `${styles.dot} ${styles.dotBad}` : styles.dot}
            aria-hidden="true"
          />
          <span className={isBad(server.result) ? styles.bad : undefined}>
            {`${server.name} ${stateLabel(server.result)}`}
          </span>
        </span>
      ))}

      {checkedAt && !hasProblem && (
        <span className={styles.time}>{`${kstTimeString(checkedAt)} 확인`}</span>
      )}

      {/* 정상일 때는 버튼을 두지 않는다. 포커스가 돌아올 때 알아서 다시 확인하므로
          누를 이유가 없고, 누를 것이 없는 줄이라야 배경으로 물러난다 */}
      {hasProblem && (
        <span className={styles.action}>
          <ActionButton size="xsmall" variant="neutralOutline" loading={checking} onClick={refresh}>
            다시 확인
          </ActionButton>
        </span>
      )}
    </div>
  )
}
