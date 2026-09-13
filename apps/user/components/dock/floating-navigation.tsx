'use client'

import { AnimatePresence, motion, useSpring, useTransform } from 'motion/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLayoutEffect, useRef, useState } from 'react'
import { useLang } from '@/components/lang-provider'
import { ArrowLeftIcon, ArrowUpIcon, HomeIcon, PAGE_ICONS } from '@/components/icons'
import { DOCK_BOTTOM } from '@/libs/dock'
import { useShell } from '@/hooks/use-shell'
import { backHref, langHref, PAGE_PATHS, type PagePath } from '@/libs/routes'

// dock 의 이동·폭 변화와 탭 인디케이터가 같은 물리를 쓴다
const SPRING_PHYSICS = { stiffness: 500, damping: 34 } as const
const SPRING = { type: 'spring', ...SPRING_PHYSICS } as const
// 아이콘이 "뿅" 하고 나타나고 사라지는 감각
const POP = { type: 'spring', stiffness: 700, damping: 26, mass: 0.6 } as const

/** dock 안쪽 여백. p-1.5 와 같은 값이라 한쪽만 바뀌면 인디케이터가 어긋난다. */
const RAIL_PADDING = 6
/** 동작 버튼 폭. w-11 과 같은 값. */
const MAIN_BUTTON = 44
/** 동작 버튼과 첫 탭 사이 간격. */
const TABS_GAP = 8
/** 안쪽 여백 기준으로 탭 줄이 시작하는 자리. */
const TABS_LEFT = MAIN_BUTTON + TABS_GAP
/** 탭이 나눠 가지지 못하는 폭. */
const RAIL_INSET = RAIL_PADDING * 2 + TABS_LEFT
/** 펼친 탭 한 칸의 높이. */
const TAB_HEIGHT = 52
/** tokens.css 의 --shape-dock-item = --shape-dock(32) - 6. clip-path 는 보간 대상이라 CSS 변수를 넣을 수 없다. */
const DOCK_ITEM_RADIUS = 26
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

/**
 * 탭 한 칸의 내용. 바탕 줄과 알약 위 덮개 줄이 픽셀 단위로 겹쳐야 해서 두 겹이 같은 것을 쓴다.
 * 글자 굵기를 활성 여부로 가르면 글자 폭이 달라져 마스크가 어긋나므로 한 값으로 고정한다.
 */
function TabFace({ path, width }: { path: PagePath; width: number }) {
  const { copy } = useLang()
  const Icon = PAGE_ICONS[path]

  return (
    <span
      style={{ width, height: TAB_HEIGHT }}
      className="flex shrink-0 flex-col items-center justify-center gap-0.5"
    >
      {/* 아이콘 색은 currentColor 라 두 겹이 클래스 하나로 갈린다 */}
      <span className="flex size-[30px] items-center justify-center">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-[11px] leading-[13px] font-medium tracking-tight">
        {copy.pages[path].short}
      </span>
    </span>
  )
}

export function FloatingNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { lang, copy } = useLang()
  const { dockPhase, scrollRef } = useShell()
  const [railRef, tabWidth] = useTabWidth()
  const [returningHome, setReturningHome] = useState(false)

  const home = langHref(lang)
  const isHome = pathname === home
  // 상세 화면에서 돌아갈 곳. 여기서는 탭을 아예 내주지 않는다
  const back = backHref(lang, pathname)
  // 홈과 상세에서 dock 이 단일 버튼으로 접힌다
  const collapsed = returningHome || isHome || back !== null
  // 랜딩 맨 위에서는 dock 을 숨긴다
  const atLanding = isHome && dockPhase === 'landing'
  // 홈 복귀 애니메이션이 끝날 때까지 홈 아이콘을 유지한다
  const slot = returningHome ? 'home' : back ? 'back' : !isHome ? 'home' : 'up'

  const activeIndex = PAGE_PATHS.findIndex((path) => pathname === langHref(lang, path))
  const showIndicator = !collapsed && activeIndex >= 0

  /**
   * 알약의 x 하나로 덮개의 clip-path 까지 만든다. 둘에 각각 애니메이션을 걸면
   * 미세하게 어긋나면서 글자 색이 알약 경계를 넘나든다.
   */
  const indicatorX = useSpring(TABS_LEFT + Math.max(activeIndex, 0) * tabWidth, SPRING_PHYSICS)
  // 함수형이라 렌더마다 새 tabWidth 를 잡는다. 폭을 다시 잰 뒤에도 마스크가 낡지 않는다
  const maskedRow = useTransform(() => {
    // 덮개 줄 안에서 알약이 놓인 자리만 남긴다
    const left = indicatorX.get() - TABS_LEFT
    const right = PAGE_PATHS.length * tabWidth - left - tabWidth
    return `inset(0px ${right}px 0px ${left}px round ${DOCK_ITEM_RADIUS}px)`
  })

  const wasShown = useRef(false)
  const lastIndex = useRef(activeIndex)

  useLayoutEffect(() => {
    if (!showIndicator) {
      wasShown.current = false
      return
    }
    const target = TABS_LEFT + activeIndex * tabWidth
    // 탭이 바뀐 것이 아니라 폭만 다시 재어졌거나 dock 이 막 펼쳐진 것이면 미끄러지지 않고 바로 옮긴다
    if (!wasShown.current || lastIndex.current === activeIndex) indicatorX.jump(target)
    else indicatorX.set(target)
    wasShown.current = true
    lastIndex.current = activeIndex
  }, [showIndicator, activeIndex, tabWidth, indicatorX])

  function handleMain() {
    if (returningHome) return
    // 상세에서는 링크로 바로 들어왔더라도 목록으로 나간다
    if (back) {
      router.push(back)
      return
    }
    // 다른 페이지에서는 홈으로 이동한다
    if (!isHome) {
      setReturningHome(true)
      router.push(home)
      return
    }
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-[1000] px-4"
      style={{ bottom: DOCK_BOTTOM }}
    >
      {/* 홈 복귀 때는 왼쪽 홈 버튼 자리를 고정하고, 스크롤 버튼은 오른쪽에 둔다 */}
      <div
        ref={railRef}
        className="flex"
        style={{ justifyContent: returningHome ? 'flex-start' : 'flex-end' }}
      >
        {/* layout 이 위치와 폭 변화를 transform 으로 이어 그린다 */}
        <motion.nav
          layout
          initial={false}
          animate={{
            scale: atLanding || returningHome ? 0 : 1,
            opacity: atLanding || returningHome ? 0 : 1,
          }}
          transition={{
            layout: SPRING,
            scale: { ...POP, delay: returningHome ? 0.3 : 0 },
            opacity: { duration: 0.15, delay: returningHome ? 0.3 : 0 },
          }}
          onAnimationComplete={() => {
            if (returningHome) setReturningHome(false)
          }}
          inert={atLanding || returningHome}
          style={{ transformOrigin: returningHome ? '28px center' : 'center' }}
          className="pointer-events-auto flex items-center rounded-dock border liquid-glass liquid-glass--panel p-1.5"
        >
          {/* 탭들은 이 동작 버튼 쪽으로 접힌다. 목적지 넷과 달리 이름을 달지 않는다 */}
          <motion.button
            layout
            type="button"
            onClick={handleMain}
            // 접히면 원 하나로 남아야 하므로 여기서 높이도 같이 줄인다
            style={{ height: collapsed ? 44 : TAB_HEIGHT }}
            aria-label={slot === 'back' ? copy.back : slot === 'up' ? copy.toTop : copy.home}
            className="relative flex w-11 shrink-0 items-center justify-center rounded-pill"
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
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {/* 바탕 줄. 목록에서는 오른쪽으로 펼쳐지고, 홈이나 상세로 가면 동작 버튼 쪽으로 접힌다 */}
          <AnimatePresence>
            {!collapsed &&
              PAGE_PATHS.map((path, index) => {
                const href = langHref(lang, path)
                const active = pathname === href
                return (
                  <motion.div
                    key={path}
                    // 폭 0 에서 탭 한 칸으로 벌어지는 것이 곧 펼침 애니메이션이다.
                    // 첫 탭의 왼쪽 여백이 동작 버튼과의 간격이라, 접히면 그것도 같이 걷힌다
                    initial={{ width: 0, marginLeft: 0, opacity: 0 }}
                    animate={{
                      width: tabWidth,
                      marginLeft: index === 0 ? TABS_GAP : 0,
                      opacity: 1,
                    }}
                    // 접힐 때는 바깥 탭부터 순서대로 사라져 동작 버튼 쪽으로 합쳐진다
                    exit={{
                      width: 0,
                      marginLeft: 0,
                      opacity: 0,
                      transition: { duration: 0.16, delay: (PAGE_PATHS.length - 1 - index) * 0.03 },
                    }}
                    // 펼칠 때는 안쪽 탭부터 한 박자씩 늦게 벌어진다
                    transition={{ ...SPRING, delay: index * 0.035 }}
                    className="relative shrink-0 overflow-hidden"
                    style={{ height: TAB_HEIGHT }}
                  >
                    <Link
                      href={href}
                      // 보이는 것은 줄인 이름이라, 읽어 줄 때는 온전한 이름을 준다
                      aria-label={copy.pages[path].label}
                      aria-current={active ? 'page' : undefined}
                      className="flex text-ink-muted"
                    >
                      <TabFace path={path} width={tabWidth} />
                    </Link>
                  </motion.div>
                )
              })}
          </AnimatePresence>

          {/*
            알약과 그 위 덮개. 탭 래퍼는 접힘 때문에 overflow-hidden 이라 알약을 안에 두면
            옮겨 가는 동안 잘려 사라진다. 그래서 레일 위에 따로 얹어 탭들을 가로지르게 한다
          */}
          <AnimatePresence>
            {showIndicator && (
              <motion.div
                key="indicator"
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                // 탭들이 다 벌어진 뒤에 얹힌다. 펼치는 중에는 자리가 아직 정해지지 않았다
                transition={{ duration: 0.18, delay: 0.2 }}
                className="pointer-events-none absolute inset-1.5"
              >
                <motion.span
                  style={{ x: indicatorX, width: tabWidth, height: TAB_HEIGHT }}
                  className="absolute top-0 left-0 rounded-dock-item bg-accent"
                />
                {/* 알약이 덮은 픽셀만 글자와 아이콘이 뒤집힌다 */}
                <motion.div
                  style={{ clipPath: maskedRow, left: TABS_LEFT, height: TAB_HEIGHT }}
                  className="absolute top-0 flex text-accent-ink"
                >
                  {PAGE_PATHS.map((path) => (
                    <TabFace key={path} path={path} width={tabWidth} />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </div>
    </div>
  )
}
