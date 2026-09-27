'use client'

import * as Dialog from '@radix-ui/react-dialog'
import type { PerformanceType } from '@quen/schema/entities/performance'
import { LiveBadge } from './LiveBadge'
import type { Performance } from './performance'
import { PerformanceModal } from './PerformanceModal'

// 임시 색. 디자인이 정해지면 팔레트 토큰으로 바꾼다. 공연 중 테두리의 안쪽 덮개도 이 변수를 읽는다
const CARD_BG: Record<PerformanceType, string> = {
  STUDENT: '[--card-bg:#f5dbba]',
  SPECIAL: '[--card-bg:#f5c0ac]',
  ARTIST: '[--card-bg:#dfb3c1]',
}

/** 타임라인의 공연 한 줄. 종류마다 색이 다르고, 공연 중이면 뱃지와 노을빛 테두리가 돌며 누르면 상세가 뜬다 */
export function PerformanceCard({ performance }: { performance: Performance }) {
  const { type, title, is_live } = performance
  return (
    <Dialog.Root>
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
      <PerformanceModal performance={performance} />
    </Dialog.Root>
  )
}
