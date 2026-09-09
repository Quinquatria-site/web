import { ActionButton } from 'seed-design/ui/action-button'
import { useAuth } from '../auth/authContext'
import styles from './HomeRoute.module.css'

/** 가드 안쪽의 첫 화면. 운영 화면은 다음 단계부터 여기에 붙인다. */
export function HomeRoute() {
  const { logout } = useAuth()

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>운영 홈</h1>
      <p className={styles.description}>화면은 다음 단계부터 하나씩 붙입니다.</p>

      <div className={styles.footer}>
        <ActionButton variant="neutralWeak" size="large" onClick={logout}>
          로그아웃
        </ActionButton>
      </div>
    </div>
  )
}
