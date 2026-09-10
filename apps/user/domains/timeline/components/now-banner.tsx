'use client'

import { motion } from 'motion/react'
import { useLang } from '@/components/lang-provider'
import type { FestivalEvent } from '@/mocks/types'
import type { Phase } from '../libs/schedule'

export function NowBanner({
  phase,
  event,
  onJump,
}: {
  phase: Phase
  event: FestivalEvent
  onJump: () => void
}) {
  const { lang, copy } = useLang()
  const live = phase === 'live'

  return (
    <motion.button
      type="button"
      onClick={onJump}
      whileTap={{ scale: 0.98 }}
      className={`relative block h-28 w-full overflow-hidden rounded-banner border text-left ${
        live ? 'border-accent bg-surface' : 'border-line bg-surface'
      }`}
    >
      {live ? (
        <>
          <span className="absolute top-4 left-8 flex items-center gap-2">
            {/* 숨 쉬듯 커졌다 작아지는 점 하나가 진행 중이라는 신호다 */}
            <motion.span
              aria-hidden
              className="size-2 rounded-pill bg-accent"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="text-[15px] leading-5 font-semibold tracking-tight">
              {copy.timeline.live}
            </span>
          </span>
          <span className="absolute right-8 bottom-4 max-w-[70%] text-right text-[17px] leading-6 font-semibold tracking-tight">
            {event.name[lang]}
          </span>
          {/* 테두리가 천천히 밝아졌다 잦아든다 */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-banner ring-2 ring-accent"
            animate={{ opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      ) : (
        <span className="absolute inset-0 flex items-center justify-center px-8 text-center text-[17px] leading-6 font-semibold tracking-tight">
          {copy.timeline[phase]}
        </span>
      )}

      <span className="sr-only">{copy.timeline.banner}</span>
    </motion.button>
  )
}
