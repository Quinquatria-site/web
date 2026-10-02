import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import { Snackbar, useSnackbarAdapter } from 'seed-design/ui/snackbar'
import { useAuth } from '../auth/authContext'
import {
  clearErrorLog,
  ERROR_LOG_HASH,
  formatErrorLog,
  useErrorLog,
  type ErrorLogEntry,
  type ErrorLogNavState,
} from '../lib/errorLog'
import { useNow } from '../lib/useNow'
import styles from './SettingsRoute.module.css'

/** 이 아래로 남으면 경고색. 저장하던 것을 마무리하고 다시 로그인할 여유다 */
const EXPIRY_WARNING_MS = 30 * 60 * 1000

/**
 * 탭을 차지할 만큼 자주 쓰지 않아 상단바 톱니로 연다.
 *
 * 한때 여기 "시각 미리보기" 네 줄(1일차 저녁·2일차 아침·다음 날…)이 있었지만,
 * 홈에서 걷어낸 "날마다 다른 화면" 이 목록 모양으로 남아 있는 꼴이었다.
 * 지금은 홈 헤더의 버튼 하나가 그 일을 한다.
 */
export function SettingsRoute() {
  const { expiresAt, logout } = useAuth()
  const now = useNow(null)

  return (
    <div className={styles.screen}>
      <Session expiresAt={expiresAt} now={now.getTime()} onRelogin={logout} />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>화면 새로고침</h2>
        <p className={styles.sectionBody}>
          학생 화면은 정적으로 만들어져 있어 수정이 바로 반영되지 않습니다. 자동 반영이 실패했을 때
          여기서 다시 요청합니다.
        </p>
        {/* POST /api/v1/revalidations 는 202 만 주고 재생성 완료를 보장하지 않는다.
            버튼을 붙일 때 문구를 "요청했습니다" 로 두고 "반영됐습니다" 라고 쓰지 않는다 */}
        <p className={styles.sectionBody}>재검증 버튼은 API 연동 시 붙습니다.</p>
      </section>

      <ErrorLog />

      <div className={styles.footer}>
        <ActionButton variant="neutralWeak" size="large" onClick={logout}>
          로그아웃
        </ActionButton>
      </div>
    </div>
  )
}

/** "3시간 12분". 1분이 안 남으면 그렇게 말한다 — "0분 남음" 은 이미 끝난 것처럼 읽힌다 */
function remainingLabel(ms: number): string {
  const minutes = Math.floor(ms / 60_000)
  if (minutes < 1) return '1분 미만'
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return hours > 0 ? `${hours}시간 ${rest}분` : `${rest}분`
}

/**
 * 로그인이 언제 풀리는지. 토큰은 5시간이면 죽고, 죽은 뒤 첫 저장이 401 을 받으면
 * 로그인 화면으로 튕겨 입력하던 것이 날아간다. 미리 보고 다시 로그인하게 한다.
 */
function Session({
  expiresAt,
  now,
  onRelogin,
}: {
  expiresAt: number | null
  now: number
  onRelogin: () => void
}) {
  if (expiresAt === null) return null
  const remaining = Math.max(expiresAt - now, 0)
  const soon = remaining < EXPIRY_WARNING_MS
  const until = new Date(expiresAt).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>로그인</h2>
      <p className={soon ? `${styles.sessionLine} ${styles.soon}` : styles.sessionLine}>
        {`${remainingLabel(remaining)} 남음 · ${until}까지`}
      </p>
      {soon && (
        <p className={styles.sectionBody}>
          곧 로그인이 풀립니다. 저장할 것을 먼저 저장하고 다시 로그인하세요.
        </p>
      )}
      <div>
        <ActionButton variant="neutralOutline" size="small" onClick={onRelogin}>
          다시 로그인
        </ActionButton>
      </div>
    </section>
  )
}

/**
 * 폰에는 devtools 가 없어서, 무엇이 실패했는지 화면에서 보고 복사해 보낼 수 있게 한다.
 * 기록하는 내용은 lib/errorLog.ts 참고 — 요청 본문과 토큰은 남기지 않는다.
 */
function ErrorLog() {
  const entries = useErrorLog()
  const snackbar = useSnackbarAdapter()
  const location = useLocation()
  const sectionRef = useRef<HTMLElement>(null)
  const highlight = (location.state as ErrorLogNavState | null)?.highlight

  // 실제로 스크롤되는 곳이 문서가 아니라 셸의 .body 라 브라우저가 해시로 찾아가 주지 않는다.
  // location.key 를 보는 것은 설정 화면에 있는 채로 알림을 또 눌렀을 때도 다시 내려가게 하려는 것이다
  useEffect(() => {
    if (location.hash !== `#${ERROR_LOG_HASH}`) return
    sectionRef.current?.scrollIntoView({ block: 'start' })
  }, [location.hash, location.key])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(formatErrorLog(entries))
      snackbar.create({ timeout: 3000, render: () => <Snackbar message="복사했습니다" /> })
    } catch {
      snackbar.create({
        timeout: 3000,
        render: () => <Snackbar variant="critical" message="복사하지 못했습니다" />,
      })
    }
  }

  return (
    <section id={ERROR_LOG_HASH} ref={sectionRef} className={styles.section}>
      <div className={styles.logHeader}>
        <h2 className={styles.sectionTitle}>{`오류 기록 ${entries.length}`}</h2>
        <div className={styles.logActions}>
          <ActionButton
            variant="neutralOutline"
            size="xsmall"
            disabled={entries.length === 0}
            onClick={copy}
          >
            복사
          </ActionButton>
          <ActionButton
            variant="neutralOutline"
            size="xsmall"
            disabled={entries.length === 0}
            onClick={clearErrorLog}
          >
            지우기
          </ActionButton>
        </div>
      </div>
      {entries.length === 0 ? (
        <p className={styles.sectionBody}>이 탭에서 난 오류가 없습니다.</p>
      ) : (
        <ol className={styles.log}>
          {entries.map((entry) => (
            <LogRow key={entry.id} entry={entry} highlighted={entry.id === highlight} />
          ))}
        </ol>
      )}
    </section>
  )
}

function LogRow({ entry, highlighted }: { entry: ErrorLogEntry; highlighted: boolean }) {
  const time = new Date(entry.at).toLocaleTimeString('ko-KR', { hour12: false })
  const badge =
    entry.kind === 'api' ? `${entry.status || '연결 실패'} ${entry.code ?? ''}` : '화면 오류'
  return (
    <li className={highlighted ? `${styles.logRow} ${styles.highlighted}` : styles.logRow}>
      <div className={styles.logLine}>
        <span className={styles.logTime}>{time}</span>
        <span className={styles.logBadge}>{badge.trim()}</span>
      </div>
      <div className={styles.logTitle}>{entry.title}</div>
      <div className={styles.logMessage}>{entry.message}</div>
      {entry.details?.map((detail) => (
        <div
          key={detail.field}
          className={styles.logMessage}
        >{`${detail.field}: ${detail.reason}`}</div>
      ))}
    </li>
  )
}
