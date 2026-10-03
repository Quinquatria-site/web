'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { motion } from 'motion/react'
import { useState } from 'react'
import type { PerformanceType } from '@quen/schema/entities/performance'
import { DOCK_PRESS, PRESS_SCALE } from '@/shared/dock/dock-motion'
import { useCloseOnBack } from '@/shared/history/useCloseOnBack'
import { contentLang } from '@/shared/i18n/locales'
import { LiveBadge } from './LiveBadge'
import type { Performance } from './performance'
import { PerformanceModal } from './PerformanceModal'

// 공연 중 테두리의 안쪽 덮개도 이 변수를 읽는다. 아티스트만 바탕이 어두워 글자·화살표를 밝게 뒤집는다
const CARD_TONE: Record<PerformanceType, string> = {
  STUDENT: '[--card-bg:var(--color-performance-student)] text-text',
  SPECIAL: '[--card-bg:var(--color-performance-special)] text-text',
  ARTIST:
    '[--card-bg:var(--color-performance-artist)] text-on-performance-artist [--card-chevron:var(--beige-yellow)]',
}

/** 타임라인의 공연 한 줄. 종류마다 색이 다르고, 공연 중이면 뱃지와 노을빛 테두리가 돌며 누르면 상세가 뜬다 */
export function PerformanceCard({ performance }: { performance: Performance }) {
  const { type, title, is_live, language_code } = performance
  const [open, setOpen] = useState(false)
  useCloseOnBack(open, () => setOpen(false))

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* 누르는 동안 도크와 같은 스프링으로 살짝 줄어 손끝 반응을 준다 */}
      <motion.div whileTap={{ scale: PRESS_SCALE }} transition={DOCK_PRESS}>
        <Dialog.Trigger
          className={`relative flex h-10 w-full items-center gap-2 rounded-[4px] bg-(--card-bg) pr-[34px] pl-2.5 text-left text-[length:calc(16*var(--tl,1px))] leading-[normal] font-medium ${CARD_TONE[type]} ${is_live ? 'live-border' : ''}`}
        >
          <span lang={contentLang(language_code)} className="truncate">
            {title}
          </span>
          {is_live && <LiveBadge />}
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="absolute top-1/2 right-2.5 size-6 -translate-y-1/2 fill-(--card-chevron,var(--color-text))"
          >
            <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </Dialog.Trigger>
      </motion.div>
      <PerformanceModal performance={performance} />
    </Dialog.Root>
  )
}
