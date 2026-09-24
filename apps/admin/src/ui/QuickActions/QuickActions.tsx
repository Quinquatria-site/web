import type { ReactNode } from 'react'
import { Link } from 'react-router'
import styles from './QuickActions.module.css'

export interface QuickActionsProps {
  children: ReactNode
}

/** 바로가기 줄. 전부 이동이라 nav 다 */
export function QuickActions({ children }: QuickActionsProps) {
  return (
    <nav aria-label="바로가기" className={styles.row}>
      {children}
    </nav>
  )
}

export interface QuickActionProps {
  icon: ReactNode
  label: string
  /** 있으면 Link. 없거나 disabled 면 눌리지 않는 버튼 */
  to?: string
  disabled?: boolean
  /** 비활성인 이유를 라벨 아래 작게. "API 연동 시" */
  hint?: string
}

/**
 * 아이콘 위 · 라벨 아래의 한 칸. 아이콘은 장식이라 aria-hidden 이고 접근성
 * 이름은 라벨(+힌트)이다.
 *
 * 비활성은 진짜 button 의 disabled 로 한다. Link 에 aria-disabled 를 달면 여전히
 * 포커스가 잡히고 눌리는데, 눌리지 않는 링크는 더 헷갈린다.
 */
export function QuickAction({ icon, label, to, disabled = false, hint }: QuickActionProps) {
  const body = (
    <>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.label}>{label}</span>
      {/* 힌트 줄은 늘 그린다. 한 칸만 있으면 그 칸만 높아져 아이콘 높이가 어긋난다 */}
      <span className={styles.hint}>{hint}</span>
    </>
  )

  if (disabled || !to) {
    return (
      <button type="button" className={styles.action} disabled>
        {body}
      </button>
    )
  }
  return (
    <Link to={to} className={styles.action}>
      {body}
    </Link>
  )
}
