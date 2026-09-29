'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, type CSSProperties } from 'react'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { DOCK_TABS } from './dock-mode'
import { BAR_COLLAPSE, DOCK_POP, PRESS_SCALE } from './dock-motion'
import { DockButton } from './DockButton'
import { DockTabs } from './DockTabs'
import { useDockMode } from './useDockMode'
import { usePreviousMode } from './usePreviousMode'

/** 앱 전체에 하나만 떠 있는 도크. 모드가 바뀌면 원과 탭바 사이를 이어서 변한다 */
export function Dock() {
  const locale = useLocale()
  const mode = useDockMode()
  const from = usePreviousMode(mode)
  const hidden = mode === 'hidden'

  useEffect(() => {
    // 본문 끝 여백이 CSS 만으로 모드를 따라가게 html 에 적는다
    document.documentElement.dataset.dock = mode
  }, [mode])

  return (
    <motion.nav
      aria-label={getMessages(locale).dock.label}
      initial={false}
      animate={{ scale: hidden ? 0 : 1, opacity: hidden ? 0 : 1 }}
      // 원은 도크 자체가 버튼이라 도크를 줄이고, 탭바는 탭마다 따로 줄인다
      whileTap={mode === 'tabs' ? undefined : { scale: PRESS_SCALE }}
      // 탭바에서 숨을 때는 원으로 다 접힌 뒤에 사라진다
      transition={{ ...DOCK_POP, delay: hidden && from === 'tabs' ? BAR_COLLAPSE : 0 }}
      inert={hidden}
      style={
        {
          // 원은 오른쪽 아래에 두고 탭바만 가운데로 옮긴다
          right:
            mode === 'tabs'
              ? 'calc(var(--dock-right) + var(--dock-bar-offset))'
              : 'var(--dock-right)',
          '--dock-tab-width': `calc((var(--dock-bar-width) - 2 * var(--dock-tab-side) - ${DOCK_TABS.length - 1} * var(--dock-tab-gap)) / ${DOCK_TABS.length})`,
        } as CSSProperties
      }
      // 피그마 테두리는 60 안쪽에 그려져서 바깥으로 두꺼워지는 ring 대신 inset-ring 을 쓴다
      className="fixed bottom-(--dock-bottom) flex h-(--dock-size) overflow-hidden rounded-full bg-dock/85 p-(--dock-pad) text-on-dock shadow-[0_4px_6px_color-mix(in_srgb,var(--sunlight)_16%,transparent)] inset-ring inset-ring-dock-border transition-[right] duration-300 ease-out"
    >
      <DockTabs open={mode === 'tabs'} />
      <AnimatePresence initial={false}>
        {mode !== 'tabs' && <DockButton key="button" mode={mode} />}
      </AnimatePresence>
    </motion.nav>
  )
}
