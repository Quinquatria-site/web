import { Outlet } from 'react-router'
import styles from './AppLayout.module.css'

/**
 * 데스크톱에서도 모바일 폭으로 고정하는 셸. 로그인 화면까지 포함해 모두 이 안에 든다.
 * AppBar 와 하단 탭은 화면이 둘 이상 될 때 여기에 붙인다.
 */
export function AppLayout() {
  return (
    <div className={styles.page}>
      <div className={styles.viewport}>
        <Outlet />
      </div>
    </div>
  )
}
