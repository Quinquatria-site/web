import type { ComponentType } from 'react'
import { NavLink } from 'react-router'
import styles from './BottomTabBar.module.css'

export interface BottomTab {
  to: string
  label: string
  icon: ComponentType<{ width?: number; height?: number }>
}

export interface BottomTabBarProps {
  tabs: BottomTab[]
}

/** SEED 에 하단 탭이 없어 직접 만든다. */
export function BottomTabBar({ tabs }: BottomTabBarProps) {
  return (
    <nav className={styles.bar} aria-label="주요 메뉴">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => (isActive ? `${styles.tab} ${styles.active}` : styles.tab)}
        >
          <Icon width={24} height={24} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
