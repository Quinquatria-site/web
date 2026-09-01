import { IconChevronLeftLine } from '@karrotmarket/react-monochrome-icon'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import styles from './AppBar.module.css'

export interface AppBarProps {
  title: ReactNode
  /** 뒤로가기 버튼 표시 */
  back?: boolean
  /** 우측 슬롯. 저장·추가 같은 화면 액션 */
  action?: ReactNode
}

/**
 * SEED 의 app-screen 은 Stackflow 의존이라 쓸 수 없어 직접 만든다.
 */
export function AppBar({ title, back = false, action }: AppBarProps) {
  const navigate = useNavigate()

  return (
    <header className={styles.bar}>
      <div className={styles.slot}>
        {back && (
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => navigate(-1)}
            aria-label="뒤로"
          >
            <IconChevronLeftLine width={24} height={24} />
          </button>
        )}
      </div>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.slot}>{action}</div>
    </header>
  )
}
