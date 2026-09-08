'use client'

import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useShell } from '@/hooks/use-shell'
import { ArrowDownIcon, ArrowUpIcon } from './icons'
import { DOCK_HOME, DOCK_ITEMS } from './routes'

// dock 의 이동·폭 변화와 탭 인디케이터
const SPRING = { type: 'spring', stiffness: 500, damping: 34 } as const
// 아이콘이 "뿅" 하고 나타나고 사라지는 감각
const POP = { type: 'spring', stiffness: 700, damping: 26, mass: 0.6 } as const

export function FloatingNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { dockPhase, homeAnchorRef, scrollRef } = useShell()

  // 홈에서만 dock 이 단일 버튼으로 접힌다
  const isHome = pathname === '/'
  // 랜딩에 머무는 동안에만 버튼이 하단 가운데에 있다
  const atLanding = isHome && dockPhase === 'landing'
  // 버튼 안에 무엇이 들어갈지: 아래 화살표 · 위 화살표 · 홈 아이콘
  const slot = !isHome ? 'home' : dockPhase === 'scrolled' ? 'up' : 'down'

  function handleMain() {
    // 다른 페이지에서는 홈으로 이동한다
    if (!isHome) {
      router.push(DOCK_HOME.href)
      return
    }
    // 위 화살표는 랜딩 맨 위로, 아래 화살표는 랜딩 다음 섹션으로
    if (dockPhase === 'scrolled') {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      homeAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    // 가운데 ↔ 우측 이동은 이 줄의 정렬만 바꾸고, 실제 움직임은 layout 이 그린다
    <div
      className="pointer-events-none absolute inset-x-0 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-[1000] flex px-4"
      style={{ justifyContent: atLanding ? 'center' : 'flex-end' }}
    >
      {/* layout 이 위치와 폭 변화를 transform 으로 이어 그린다 */}
      <motion.nav
        layout
        transition={SPRING}
        className="pointer-events-auto flex items-center rounded-full border border-line/70 bg-surface/70 p-1.5 shadow-lg shadow-black/10 backdrop-blur-md"
      >
        {/* 홈을 벗어나면 왼쪽으로 펼쳐지고, 홈으로 돌아오면 오른쪽으로 접힌다 */}
        <AnimatePresence>
          {!isHome &&
            DOCK_ITEMS.map((item, index) => {
              const active = pathname === item.href
              return (
                <motion.div
                  key={item.href}
                  // 폭 0 에서 44 로 벌어지는 것이 곧 펼침 애니메이션이다
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 44, opacity: 1 }}
                  // 접힐 때는 왼쪽 탭부터 순서대로 사라져 오른쪽으로 합쳐진다
                  exit={{
                    width: 0,
                    opacity: 0,
                    transition: { duration: 0.16, delay: (DOCK_ITEMS.length - 1 - index) * 0.03 },
                  }}
                  // 펼칠 때는 오른쪽 탭부터 한 박자씩 늦게 벌어진다
                  transition={{ ...SPRING, delay: index * 0.035 }}
                  className="relative h-11 shrink-0 overflow-hidden"
                >
                  <Link
                    href={item.href}
                    // 아이콘만 있는 탭이라 이름은 여기서 읽힌다
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    className="relative flex h-11 w-11 items-center justify-center rounded-full"
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
                </motion.div>
              )
            })}
        </AnimatePresence>

        {/* 경로가 바뀌어도 이 버튼만은 사라지지 않고 자리만 옮긴다 */}
        <motion.button
          layout
          type="button"
          onClick={handleMain}
          aria-label={slot === 'up' ? '맨 위로' : slot === 'down' ? '아래로' : DOCK_HOME.label}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        >
          {/* mode="wait" 라서 먼저 뿅 사라진 뒤에 다음 아이콘이 뿅 나타난다 */}
          <AnimatePresence mode="wait" initial={false}>
            {/* key 가 바뀌는 것이 곧 아이콘 교체 신호다 */}
            <motion.span
              key={slot}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={POP}
              className="flex items-center justify-center"
            >
              {slot === 'home' && <DOCK_HOME.Icon className="h-5 w-5 text-ink-muted" />}
              {slot === 'up' && <ArrowUpIcon className="h-5 w-5 text-ink" />}
              {slot === 'down' && <ArrowDownIcon className="h-5 w-5 text-ink" />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </motion.nav>
    </div>
  )
}
