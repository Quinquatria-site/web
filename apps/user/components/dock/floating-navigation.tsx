'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { DOCK_BOTTOM } from '@/libs/dock'
import { DOCK_HOME, DOCK_ITEMS } from './routes'

// 탭 인디케이터가 자리를 옮기는 감각
const SPRING = { type: 'spring', stiffness: 500, damping: 34 } as const

export function FloatingNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  // 홈은 랜딩 한 장이라 dock 을 띄우지 않는다
  if (pathname === DOCK_HOME.href) return null

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-[1000] flex justify-end px-4"
      style={{ bottom: DOCK_BOTTOM }}
    >
      <nav className="pointer-events-auto flex items-center rounded-full border border-line/70 bg-surface/70 p-1.5 shadow-lg shadow-black/10 backdrop-blur-md">
        {DOCK_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              // 아이콘만 있는 탭이라 이름은 여기서 읽힌다
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            >
              {/* layoutId 가 같아서 탭을 옮길 때 알약이 스르륵 따라온다 */}
              {active && (
                <motion.span
                  layoutId="dock-indicator"
                  transition={SPRING}
                  className="absolute inset-0.5 rounded-full bg-accent"
                />
              )}
              {/* 아이콘 색은 currentColor 라 클래스만으로 반전된다 */}
              <item.Icon
                className={`relative h-5 w-5 ${active ? 'text-accent-ink' : 'text-ink-muted'}`}
              />
            </Link>
          )
        })}

        <button
          type="button"
          onClick={() => router.push(DOCK_HOME.href)}
          aria-label={DOCK_HOME.label}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        >
          <DOCK_HOME.Icon className="h-5 w-5 text-ink-muted" />
        </button>
      </nav>
    </div>
  )
}
