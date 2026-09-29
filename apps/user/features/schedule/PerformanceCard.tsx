'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { motion } from 'motion/react'
import type { PerformanceType } from '@quen/schema/entities/performance'
import { DOCK_PRESS, PRESS_SCALE } from '@/shared/dock/dock-motion'
import { LiveBadge } from './LiveBadge'
import type { Performance } from './performance'
import { PerformanceModal } from './PerformanceModal'

// 공연 중 테두리의 안쪽 덮개도 이 변수를 읽는다
const CARD_BG: Record<PerformanceType, string> = {
  STUDENT: '[--card-bg:var(--color-performance-student)]',
  SPECIAL: '[--card-bg:var(--color-performance-special)]',
  ARTIST: '[--card-bg:var(--color-performance-artist)]',
}

/** 타임라인의 공연 한 줄. 종류마다 색이 다르고, 공연 중이면 뱃지와 노을빛 테두리가 돌며 누르면 상세가 뜬다 */
export function PerformanceCard({ performance }: { performance: Performance }) {
  const { type, title, is_live } = performance
  return (
    <Dialog.Root>
      {/* 누르는 동안 도크와 같은 스프링으로 살짝 줄어 손끝 반응을 준다 */}
      <motion.div whileTap={{ scale: PRESS_SCALE }} transition={DOCK_PRESS}>
        <Dialog.Trigger
          className={`relative flex h-10 w-full items-center gap-2 bg-(--card-bg) pr-[34px] pl-3 text-left text-base leading-[normal] font-medium text-secondary ${CARD_BG[type]} ${is_live ? 'live-border' : ''}`}
        >
          <span className="truncate">{title}</span>
          {is_live && <LiveBadge />}
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="absolute top-1/2 right-2.5 size-6 -translate-y-1/2 fill-text-muted"
          >
            <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </Dialog.Trigger>
      </motion.div>
      <PerformanceModal performance={performance} />
    </Dialog.Root>
  )
}
