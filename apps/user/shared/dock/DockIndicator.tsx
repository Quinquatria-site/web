'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useLayoutEffect, useRef } from 'react'
import { DOCK_TABS } from './dock-mode'
import { PILL_IN, TAB_EXPAND, TAB_STAGGER } from './dock-motion'
import { PILL_MOVE_MS, squeezeFrames } from './dock-squeeze'
import { DockTabFace, tabBoxClass } from './DockTabFace'

// 칸보다 양옆 1px 넓게 두는 피그마 선택 표시(칸 44 · 표시 46)
const PILL_WIDTH = 'calc(var(--dock-tab-width) + 2px)'
// 탭바는 오른쪽 원 자리에서 펼치고 접혀서, 오른쪽 끝을 기준으로 재야 움직이는 중에도 자리가 맞는다
const pillRight = (index: number) =>
  `calc(var(--dock-tab-side) - 1px + (var(--dock-tab-width) + var(--dock-tab-gap)) * ${DOCK_TABS.length - 1 - index})`

/** 탭바의 선택 표시. 선택 색 탭 줄을 알약 모양만 남겨 겹치고, 탭을 옮기면 틈을 비집고 지나가듯 움직인다 */
export function DockIndicator({ index }: { index: number | null }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLSpanElement>(null)
  const lastIndex = useRef(index)

  useLayoutEffect(() => {
    const from = lastIndex.current
    lastIndex.current = index
    const box = boxRef.current
    const pill = pillRef.current
    // 펼치거나 접힐 때는 옮겨가는 게 아니라 나타나고 사라지는 것이라 건너뛴다
    if (from === null || index === null || from === index || !box || !pill) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // 새 자리로 그려진 뒤에 재서, 탭 간격과 선택 표시 크기를 px 로 얻는다
    const icons = [...box.querySelectorAll('svg')].map((svg) => {
      const r = svg.getBoundingClientRect()
      return r.left + r.width / 2
    })
    const boxRect = box.getBoundingClientRect()
    const frames = squeezeFrames(from, index, {
      firstCenter: icons[0] - boxRect.left,
      pitch: icons[1] - icons[0],
      width: pill.offsetWidth,
      height: pill.offsetHeight,
      top: pill.offsetTop,
      boxWidth: box.clientWidth,
      boxHeight: box.clientHeight,
    })
    box.getAnimations().forEach((a) => a.cancel())
    box.animate(frames, { duration: PILL_MOVE_MS })
  }, [index])

  return (
    <AnimatePresence initial={false}>
      {index !== null && (
        <motion.div
          key="indicator"
          ref={boxRef}
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          // 접히기 시작하면 탭 자리가 바로 어긋나서 곧장 걷는다
          exit={{ opacity: 0, transition: { duration: 0 } }}
          // 선택한 탭과 그 오른쪽 탭이 다 벌어진 뒤에 얹는다
          transition={{
            duration: PILL_IN,
            delay: TAB_EXPAND + (DOCK_TABS.length - 1 - index) * TAB_STAGGER,
          }}
          style={{
            clipPath: `inset(var(--dock-pill-inset) ${pillRight(index)} var(--dock-pill-inset) calc(100% - ${pillRight(index)} - ${PILL_WIDTH}) round 20px)`,
          }}
          className="pointer-events-none absolute inset-0 z-10 flex justify-end bg-dock-selected p-(--dock-pad) text-on-dock-selected"
        >
          {DOCK_TABS.map((tab, i) => (
            <span key={tab.href} className={tabBoxClass(i)}>
              <DockTabFace tab={tab} selected />
            </span>
          ))}
          {/* 선택 표시 자리를 px 로 재는 보이지 않는 기준 */}
          <span
            ref={pillRef}
            style={{ right: pillRight(index), width: PILL_WIDTH }}
            className="absolute inset-y-(--dock-pill-inset)"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
