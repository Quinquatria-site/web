'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, type CSSProperties } from 'react'
import { DOCK_TABS } from './dock-mode'
import { BAR_COLLAPSE, DOCK_POP } from './dock-motion'
import { DockButton } from './DockButton'
import { DockTabs } from './DockTabs'
import { useDockMode } from './useDockMode'
import { usePreviousMode } from './usePreviousMode'

/** 앱 전체에 하나만 떠 있는 도크. 모드가 바뀌면 원과 탭바 사이를 이어서 변한다 */
export function Dock() {
  const mode = useDockMode()
  const from = usePreviousMode(mode)
  const hidden = mode === 'hidden'

  useEffect(() => {
    // 본문 끝 여백이 CSS 만으로 모드를 따라가게 html 에 적는다
    document.documentElement.dataset.dock = mode
  }, [mode])

  return (
    <motion.nav
      aria-label="메인 메뉴"
      // 고정 요소라 스크롤이 바뀌어도 선택 표시가 튀지 않게 레이아웃 기준을 여기로 둔다
      layoutRoot
      initial={false}
      animate={{ scale: hidden ? 0 : 1, opacity: hidden ? 0 : 1 }}
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
      // 빛 번짐은 짙은 배경, 아래 그림자는 밝은 배경에서 떠 보이게 한다. 피그마에서 테두리는 탭바에만 있다
      className={`fixed bottom-(--dock-bottom) transition-[right,box-shadow] duration-300 ease-out flex h-(--dock-size) overflow-hidden rounded-full p-(--dock-pad) bg-secondary text-on-secondary shadow-[0_0_8px_var(--color-on-secondary),0_4px_12px_color-mix(in_srgb,var(--color-secondary)_25%,transparent)] ${
        mode === 'tabs' ? 'ring-1 ring-on-secondary' : ''
      }`}
    >
      <DockTabs open={mode === 'tabs'} />
      <AnimatePresence initial={false}>
        {mode !== 'tabs' && <DockButton key="button" mode={mode} />}
      </AnimatePresence>
    </motion.nav>
  )
}
