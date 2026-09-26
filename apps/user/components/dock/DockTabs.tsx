'use client'

import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DOCK_TABS } from './dock-mode'
import { DOCK_PRESS, DOCK_SPRING, PRESS_SCALE, TAB_COLLAPSE, TAB_STAGGER } from './dock-motion'
import { DockIndicator } from './DockIndicator'
import { DockTabFace, tabBoxClass } from './DockTabFace'

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
          DOCK_TABS.map((tab, index) => (
            <motion.div
              key={tab.href}
              initial={{ width: 0 }}
              animate={{ width: 'auto' }}
              // 펼칠 때는 원에 가까운 오른쪽 탭부터 벌어진다
              // 누름은 시차 없이 바로 반응해야 해서 폭과 따로 둔다
              transition={{
                width: { ...DOCK_SPRING, delay: (last - index) * TAB_STAGGER },
                scale: DOCK_PRESS,
              }}
              // 접힐 때는 왼쪽 끝 탭부터 걷혀 오른쪽 원으로 모인다
              exit={{
                width: 0,
                transition: { duration: TAB_COLLAPSE, delay: index * TAB_STAGGER },
              }}
              // 누르는 동안 살짝 줄어 손끝 반응을 준다
              whileTap={{ scale: PRESS_SCALE }}
              className="relative shrink-0 overflow-hidden"
            >
              <Link
                href={tab.href}
                aria-current={index === activeIndex ? 'page' : undefined}
                className={tabBoxClass(index)}
              >
                <DockTabFace tab={tab} />
              </Link>
            </motion.div>
          ))}
      </AnimatePresence>
    </>
  )
}
