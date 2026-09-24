import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { IconChevronRightSmallLine } from '@karrotmarket/react-monochrome-icon'
import styles from './StatTile.module.css'

export interface StatTileGridProps {
  children: ReactNode
}

/**
 * 타일을 2열 격자에 담는다. 칸 사이 간격을 홈의 카드 gap 과 같게 두는 것은
 * 타일이 카드의 축소판이 아니라 동급 카드로 읽히게 하기 위해서다.
 */
export function StatTileGrid({ children }: StatTileGridProps) {
  return <div className={styles.grid}>{children}</div>
}

export interface StatTileProps {
  label: string
  value: ReactNode
  /** number: 큰 숫자 한 줄. text: 공연 제목처럼 긴 값 — 작게, 두 줄까지 */
  valueVariant?: 'number' | 'text'
  /** 숫자 뒤에 작게 붙는 단위·분모. "곳", "건", " / 72" */
  unit?: string
  detail?: string
  /** 값 아래 배지 슬롯. 공연 중 표시가 쓴다 */
  badge?: ReactNode
  /** 있으면 타일 전체가 링크가 되고 셰브런이 붙는다. 없으면 정적 타일 */
  to?: string
}

/**
 * 라벨 · 큰 값 · 한 줄 설명. 홈 맨 위 격자의 한 칸이다.
 *
 * 링크의 접근성 이름은 DOM 순서 그대로 "라벨 → 값 → 설명" 이다. aria-label 로
 * 덮지 않는다 — 덮으면 값이 사라진다. 셰브런은 장식이라 aria-hidden 이다.
 *
 * 값에 tabular-nums 를 쓰지 않는다. 등폭은 표에서 자릿수를 맞출 때 쓰는 것이고,
 * 큰 글씨 하나에 걸면 121 같은 값이 벌어져 보인다.
 */
export function StatTile({
  label,
  value,
  valueVariant = 'number',
  unit,
  detail,
  badge,
  to,
}: StatTileProps) {
  const body = (
    <>
      <span className={styles.head}>
        <span className={styles.label}>{label}</span>
        {to && (
          <span className={styles.chevron} aria-hidden="true">
            <IconChevronRightSmallLine width={16} height={16} />
          </span>
        )}
      </span>
      <span className={valueVariant === 'text' ? `${styles.value} ${styles.valueText}` : styles.value}>
        {value}
        {unit && <span className={styles.unit}>{unit}</span>}
      </span>
      {badge && <span className={styles.badge}>{badge}</span>}
      {detail && <span className={styles.detail}>{detail}</span>}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={styles.tile}>
        {body}
      </Link>
    )
  }
  return <div className={styles.tile}>{body}</div>
}
