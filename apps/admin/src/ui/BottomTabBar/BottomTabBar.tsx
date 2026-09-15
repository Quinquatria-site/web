import type { ComponentType } from 'react'
import { NavLink } from 'react-router'
import styles from './BottomTabBar.module.css'

type TabIcon = ComponentType<{ width?: number; height?: number }>

export interface BottomTab {
  to: string
  label: string
  icon: TabIcon
  /** 활성일 때 쓰는 채운 변형. 색만으로는 지금 어느 탭인지 잘 안 보인다 */
  activeIcon: TabIcon
}

export interface BottomTabBarProps {
  tabs: BottomTab[]
}

/** SEED 에 하단 탭이 없어 직접 만든다. */
export function BottomTabBar({ tabs }: BottomTabBarProps) {
  return (
    <nav className={styles.bar} aria-label="주요 메뉴">
      {tabs.map(({ to, label, icon: Icon, activeIcon: ActiveIcon }) => (
        <NavLink
          key={to}
          to={to}
          /* 홈은 '/' 라 end 가 없으면 모든 경로에서 활성으로 보인다 */
          end={to === '/'}
          className={({ isActive }) => (isActive ? `${styles.tab} ${styles.active}` : styles.tab)}
        >
          {/* 채움·굵기·색 셋이 함께 바뀐다. 글자를 못 읽는 거리에서도 채워진
              아이콘만으로 지금 어느 탭인지 알 수 있어야 한다 */}
          {({ isActive }) => (
            <>
              {isActive ? <ActiveIcon width={24} height={24} /> : <Icon width={24} height={24} />}
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
