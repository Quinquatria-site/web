'use client'

import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TAB_ICONS } from './dock-icons'
import { DOCK_TABS } from './dock-mode'
import { DOCK_SPRING, TAB_COLLAPSE, TAB_STAGGER } from './dock-motion'
import { DockIndicator } from './DockIndicator'

/** 탭바. 오른쪽 원 자리에서 왼쪽으로 펼쳐지고, 오른쪽으로 접힌다 */
export function DockTabs({ open }: { open: boolean }) {
  const pathname = usePathname()
  const activeIndex = DOCK_TABS.findIndex((tab) => tab.href === pathname)
  const last = DOCK_TABS.length - 1

  return (
    <>
      <DockIndicator index={open && activeIndex >= 0 ? activeIndex : null} />
      <AnimatePresence initial={false}>
        {open &&
          DOCK_TABS.map((tab, index) => {
            const Icon = TAB_ICONS[tab.href]
            const active = index === activeIndex
            return (
              <motion.div
                key={tab.href}
                initial={{ width: 0 }}
                animate={{ width: 'auto' }}
                // 펼칠 때는 원에 가까운 오른쪽 탭부터 벌어진다
                transition={{ ...DOCK_SPRING, delay: (last - index) * TAB_STAGGER }}
                // 접힐 때는 왼쪽 끝 탭부터 걷혀 오른쪽 원으로 모인다
                exit={{
                  width: 0,
                  transition: { duration: TAB_COLLAPSE, delay: index * TAB_STAGGER },
                }}
                className="relative shrink-0 overflow-hidden"
              >
                {/* 칸 사이 간격까지 누를 수 있게 칸마다 간격을 반씩 나눠 가진다 */}
                <Link
                  href={tab.href}
                  aria-current={active ? 'page' : undefined}
                  className={`box-content flex h-full w-[calc(var(--dock-tab-width)+var(--dock-tab-gap))] flex-col items-center justify-center gap-1 ${
                    index === 0 ? 'pl-(--dock-tab-end)' : ''
                  } ${index === last ? 'pr-(--dock-tab-end)' : ''} ${
                    active ? 'text-text' : 'text-text-muted'
                  }`}
                >
                  <Icon className="size-(--dock-tab-icon)" />
                  <span className="text-(length:--dock-tab-label) leading-[calc(var(--dock-tab-label)+2px)] font-medium whitespace-nowrap">
                    {tab.label}
                  </span>
                </Link>
              </motion.div>
            )
          })}
      </AnimatePresence>
    </>
  )
}
