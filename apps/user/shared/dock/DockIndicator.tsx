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
  const shadowRef = useRef<HTMLSpanElement>(null)
  const lastIndex = useRef(index)

  useLayoutEffect(() => {
    const from = lastIndex.current
    lastIndex.current = index
    const box = boxRef.current
    const shadow = shadowRef.current
    // 펼치거나 접힐 때는 옮겨가는 게 아니라 나타나고 사라지는 것이라 건너뛴다
    if (from === null || index === null || from === index || !box || !shadow) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // 새 자리로 그려진 뒤에 재서, 탭 간격과 선택 표시 크기를 px 로 얻는다
    const icons = [...box.querySelectorAll('svg')].map((svg) => {
      const r = svg.getBoundingClientRect()
      return r.left + r.width / 2
    })
    const boxRect = box.getBoundingClientRect()
    const { clip, shadow: shadowFrames } = squeezeFrames(from, index, {
      firstCenter: icons[0] - boxRect.left,
      pitch: icons[1] - icons[0],
      width: shadow.offsetWidth,
      height: shadow.offsetHeight,
      top: shadow.offsetTop,
      boxWidth: box.clientWidth,
      boxHeight: box.clientHeight,
    })
    box.getAnimations().forEach((a) => a.cancel())
    shadow.getAnimations().forEach((a) => a.cancel())
    box.animate(clip, { duration: PILL_MOVE_MS })
    shadow.animate(shadowFrames, { duration: PILL_MOVE_MS })
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
            clipPath: `inset(var(--dock-pill-inset) ${pillRight(index)} var(--dock-pill-inset) calc(100% - ${pillRight(index)} - ${PILL_WIDTH}) round 24px)`,
          }}
          className="pointer-events-none absolute inset-0 z-10 flex justify-end bg-on-secondary p-(--dock-pad) text-secondary"
        >
          {DOCK_TABS.map((tab, i) => (
            <span key={tab.href} className={tabBoxClass(i)}>
              <DockTabFace tab={tab} />
            </span>
          ))}
          {/* 눌려 들어간 느낌의 안쪽 그림자와 옅은 테두리. 잘라낸 자리와 같은 키프레임으로 따라간다 */}
          <span
            ref={shadowRef}
            style={{ right: pillRight(index), width: PILL_WIDTH }}
            className="absolute inset-y-(--dock-pill-inset) rounded-[24px] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-secondary)_25%,transparent),inset_0_2px_4px_color-mix(in_srgb,var(--color-secondary)_28%,transparent)]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
