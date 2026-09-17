import { ActionButton } from 'seed-design/ui/action-button'
import { useAuth } from '../auth/authContext'
import styles from './SettingsRoute.module.css'

/**
 * 탭을 차지할 만큼 자주 쓰지 않아 상단바 톱니로 연다.
 * 들어갈 것은 ISR 수동 재검증과 로그아웃 정도다.
 *
 * 한때 여기 "시각 미리보기" 네 줄(1일차 저녁·2일차 아침·다음 날…)이 있었지만,
 * 홈에서 걷어낸 "날마다 다른 화면" 이 목록 모양으로 남아 있는 꼴이었다.
 * 지금은 홈 헤더의 버튼 하나가 그 일을 한다.
 */
export function SettingsRoute() {
  const { logout } = useAuth()

  return (
    <div className={styles.screen}>
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

      <div className={styles.footer}>
        <ActionButton variant="neutralWeak" size="large" onClick={logout}>
          로그아웃
        </ActionButton>
      </div>
    </div>
  )
}
