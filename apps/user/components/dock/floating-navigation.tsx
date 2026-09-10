'use client'

import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLayoutEffect, useRef, useState } from 'react'
import { useLang } from '@/components/lang-provider'
import { ArrowDownIcon, ArrowLeftIcon, ArrowUpIcon, HomeIcon, PAGE_ICONS } from '@/components/icons'
import { DOCK_BOTTOM } from '@/libs/dock'
import { useShell } from '@/hooks/use-shell'
import { backHref, langHref, PAGE_PATHS } from '@/libs/routes'

// dock 의 이동·폭 변화와 탭 인디케이터
const SPRING = { type: 'spring', stiffness: 500, damping: 34 } as const
// 아이콘이 "뿅" 하고 나타나고 사라지는 감각
const POP = { type: 'spring', stiffness: 700, damping: 26, mass: 0.6 } as const

/** 탭이 나눠 가지지 못하는 폭. 안쪽 여백 6 씩 + 동작 버튼 44 + 그 옆 간격 8. */
const RAIL_INSET = 6 * 2 + 44 + 8
/** 360 화면 기준값. 마운트 직후 실제 폭으로 덮인다. */
const TAB_WIDTH_FALLBACK = 66

/**
 * 탭 폭을 px 로 확정한다. flex 로 나눠 가지게 두면 접힐 때 폭 0 까지 이어 그릴 수 없다.
 * 재는 대상은 dock 을 감싼 줄이고, 그 폭이 곧 펼친 dock 의 폭이다.
 */
function useTabWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(TAB_WIDTH_FALLBACK)

  useLayoutEffect(() => {
    const rail = ref.current
    if (!rail) return
    const measure = () => setWidth((rail.clientWidth - RAIL_INSET) / PAGE_PATHS.length)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(rail)
    return () => observer.disconnect()
  }, [])

  return [ref, width] as const
}

export function FloatingNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { lang, copy } = useLang()
  const { dockPhase, homeAnchorRef, scrollRef } = useShell()
  const [railRef, tabWidth] = useTabWidth()

  const home = langHref(lang)
  const isHome = pathname === home
  // 상세 화면에서 돌아갈 곳. 여기서는 탭을 아예 내주지 않는다
  const back = backHref(lang, pathname)
  // 홈과 상세에서 dock 이 단일 버튼으로 접힌다
  const collapsed = isHome || back !== null
  // 랜딩에 머무는 동안에만 버튼이 하단 가운데에 있다
  const atLanding = isHome && dockPhase === 'landing'
  // 버튼 안에 무엇이 들어갈지: 뒤로 · 홈 · 위 화살표 · 아래 화살표
  const slot = back ? 'back' : !isHome ? 'home' : dockPhase === 'scrolled' ? 'up' : 'down'

  function handleMain() {
    // 상세에서는 링크로 바로 들어왔더라도 목록으로 나간다
    if (back) {
      router.push(back)
      return
    }
    // 다른 페이지에서는 홈으로 이동한다
    if (!isHome) {
      router.push(home)
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
    <div
      className="pointer-events-none absolute inset-x-0 z-[1000] px-4"
      style={{ bottom: DOCK_BOTTOM }}
    >
      {/* 이 줄의 폭이 곧 펼친 dock 의 폭이다. 가운데 ↔ 우측 이동은 정렬만 바꾸고 움직임은 layout 이 그린다 */}
      <div
        ref={railRef}
        className="flex"
        style={{ justifyContent: atLanding ? 'center' : 'flex-end' }}
      >
        {/* layout 이 위치와 폭 변화를 transform 으로 이어 그린다 */}
        <motion.nav
          layout
          transition={SPRING}
          className="pointer-events-auto flex items-center rounded-[32px] border border-line/70 bg-surface p-1.5 shadow-lg shadow-black/10"
        >
          {/* 경로가 바뀌어도 이 버튼만은 사라지지 않고 자리만 옮긴다. 목적지 넷과 달리 이름을 달지 않는다 */}
          <motion.button
            layout
            type="button"
            onClick={handleMain}
            // 접히면 원 하나로 남아야 하므로 여기서 높이도 같이 줄인다
            style={{ height: collapsed ? 44 : 52 }}
            aria-label={
              slot === 'back'
                ? copy.back
                : slot === 'up'
                  ? copy.toTop
                  : slot === 'down'
                    ? copy.toNav
                    : copy.home
            }
            className="relative flex w-11 shrink-0 items-center justify-center rounded-full"
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
                {slot === 'back' && <ArrowLeftIcon className="h-5 w-5 text-ink" />}
                {slot === 'home' && <HomeIcon className="h-5 w-5 text-ink" />}
                {slot === 'up' && <ArrowUpIcon className="h-5 w-5 text-ink" />}
                {slot === 'down' && <ArrowDownIcon className="h-5 w-5 text-ink" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {/* 목록에서는 오른쪽으로 펼쳐지고, 홈이나 상세로 가면 동작 버튼 쪽으로 접힌다 */}
          <AnimatePresence>
            {!collapsed &&
              PAGE_PATHS.map((path, index) => {
                const href = langHref(lang, path)
                const active = pathname === href
                const Icon = PAGE_ICONS[path]
                return (
                  <motion.div
                    key={path}
                    // 폭 0 에서 탭 한 칸으로 벌어지는 것이 곧 펼침 애니메이션이다.
                    // 첫 탭의 왼쪽 여백이 동작 버튼과의 간격이라, 접히면 그것도 같이 걷힌다
                    initial={{ width: 0, marginLeft: 0, opacity: 0 }}
                    animate={{ width: tabWidth, marginLeft: index === 0 ? 8 : 0, opacity: 1 }}
                    // 접힐 때는 바깥 탭부터 순서대로 사라져 동작 버튼 쪽으로 합쳐진다
                    exit={{
                      width: 0,
                      marginLeft: 0,
                      opacity: 0,
                      transition: { duration: 0.16, delay: (PAGE_PATHS.length - 1 - index) * 0.03 },
                    }}
                    // 펼칠 때는 안쪽 탭부터 한 박자씩 늦게 벌어진다
                    transition={{ ...SPRING, delay: index * 0.035 }}
                    className="relative h-[52px] shrink-0 overflow-hidden"
                  >
                    <Link
                      href={href}
                      // 보이는 것은 줄인 이름이라, 읽어 줄 때는 온전한 이름을 준다
                      aria-label={copy.pages[path].label}
                      aria-current={active ? 'page' : undefined}
                      style={{ width: tabWidth }}
                      className={`relative flex h-[52px] flex-col items-center justify-center gap-0.5 ${
                        active ? 'text-accent-ink' : 'text-ink-muted'
                      }`}
                    >
                      {/* layoutId 가 같아서 탭을 옮길 때 알약이 스르륵 따라온다 */}
                      {active && (
                        <motion.span
                          layoutId="dock-indicator"
                          transition={SPRING}
                          className="absolute inset-0 rounded-[26px] bg-accent"
                        />
                      )}
                      {/* 아이콘 색은 currentColor 라 알약 안팎이 클래스 하나로 뒤집힌다 */}
                      <span className="relative flex size-[30px] items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span
                        className={`relative text-[11px] leading-[13px] tracking-tight ${
                          active ? 'font-semibold' : 'font-medium'
                        }`}
                      >
                        {copy.pages[path].short}
                      </span>
                    </Link>
                  </motion.div>
                )
              })}
          </AnimatePresence>
        </motion.nav>
      </div>
    </div>
  )
}
