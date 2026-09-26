'use client'

import { AnimatePresence, motion } from 'motion/react'
import { DOCK_SPRING } from './dock-motion'

/** 탭바의 선택 표시. 탭 사이를 옮겨 다니며, 탭바가 다 펼쳐진 뒤에 나타난다 */
export function DockIndicator({ index }: { index: number | null }) {
  return (
    <AnimatePresence initial={false}>
      {index !== null && (
        <motion.span
          key="indicator"
          aria-hidden
          // left 만 바꾸면 layout 이 옛 자리에서 새 자리로 이어 그린다
          layout="position"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          // 펼치는 중에는 도크 왼쪽 끝이 움직여서 다 펼친 뒤에 얹는다
          transition={{ layout: DOCK_SPRING, opacity: { duration: 0.18, delay: 0.2 } }}
          // 칸보다 양옆 1px 넓게 두는 피그마 선택 표시(칸 44 · 표시 46)
          style={{
            left: `calc(var(--dock-tab-side) - 1px + (var(--dock-tab-width) + var(--dock-tab-gap)) * ${index})`,
          }}
          className="absolute inset-y-(--dock-pill-inset) w-[calc(var(--dock-tab-width)+2px)] rounded-[20px] bg-bg-subtle"
        />
      )}
    </AnimatePresence>
  )
}
