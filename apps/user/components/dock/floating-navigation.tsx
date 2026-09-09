'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLang } from '@/components/lang-provider'
import { HomeIcon, PAGE_ICONS } from '@/components/icons'
import { DOCK_BOTTOM } from '@/libs/dock'
import { langHref, PAGE_PATHS } from '@/libs/routes'

// 탭 인디케이터가 자리를 옮기는 감각
const SPRING = { type: 'spring', stiffness: 500, damping: 34 } as const

export function FloatingNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { lang, copy } = useLang()

  const home = langHref(lang)

  // 홈은 랜딩 한 장이라 dock 을 띄우지 않는다
  if (pathname === home) return null

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-[1000] flex justify-end px-4"
      style={{ bottom: DOCK_BOTTOM }}
    >
      <nav className="pointer-events-auto flex items-center rounded-full border border-line/70 bg-surface/70 p-1.5 shadow-lg shadow-black/10 backdrop-blur-md">
        {PAGE_PATHS.map((path) => {
          const href = langHref(lang, path)
          const active = pathname === href
          const Icon = PAGE_ICONS[path]
          return (
            <Link
              key={path}
              href={href}
              // 아이콘만 있는 탭이라 이름은 여기서 읽힌다
              aria-label={copy.pages[path].label}
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
              <Icon className={`relative h-5 w-5 ${active ? 'text-accent-ink' : 'text-ink-muted'}`} />
            </Link>
          )
        })}

        <button
          type="button"
          onClick={() => router.push(home)}
          aria-label={copy.home}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        >
          <HomeIcon className="h-5 w-5 text-ink-muted" />
        </button>
      </nav>
    </div>
  )
}
