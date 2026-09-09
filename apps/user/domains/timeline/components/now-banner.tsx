'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import { useLang } from '@/components/lang-provider'
import { BOOTH_IMAGE } from '@/mocks/timeline'
import type { FestivalEvent } from '@/mocks/types'
import type { Phase } from '../libs/schedule'

/** 배너 뒤에 깔리는 사진. 끝난 뒤에는 아무것도 깔지 않는다. */
function backdrop(phase: Phase, event: FestivalEvent) {
  if (phase === 'live') return event.image
  if (phase === 'open') return BOOTH_IMAGE
  return undefined
}

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
  const image = backdrop(phase, event)

  return (
    <motion.button
      type="button"
      onClick={onJump}
      whileTap={{ scale: 0.98 }}
      className={`relative block h-28 w-full overflow-hidden rounded-3xl border text-left ${
        live ? 'border-accent bg-surface' : 'border-line bg-surface-muted'
      }`}
    >
      {image && (
        <>
          <Image
            src={image}
            alt=""
            fill
            sizes="430px"
            priority
            className="object-cover opacity-20"
          />
          {/* 사진 위에 글자가 얹히므로 한 겹 씻어 낸다 */}
          <span
            aria-hidden
            className="absolute inset-0 bg-linear-to-br from-surface/85 via-surface/45 to-surface/85"
          />
        </>
      )}

      {live ? (
        <>
          <span className="absolute top-4 left-5 flex items-center gap-2">
            {/* 숨 쉬듯 커졌다 작아지는 점 하나가 진행 중이라는 신호다 */}
            <motion.span
              aria-hidden
              className="size-2 rounded-full bg-accent"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="text-[15px] leading-5 font-semibold tracking-tight">
              {copy.timeline.live}
            </span>
          </span>
          <span className="absolute right-5 bottom-4 max-w-[70%] text-right text-[17px] leading-6 font-semibold tracking-tight">
            {event.name[lang]}
          </span>
          {/* 테두리가 천천히 밝아졌다 잦아든다 */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-3xl ring-2 ring-accent"
            animate={{ opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* 빛 한 줄기가 왼쪽에서 오른쪽으로 훑고 지나간다 */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/4 w-1/4 skew-x-[-12deg] bg-linear-to-r from-transparent via-hero-ink/45 to-transparent"
            animate={{ x: ['0%', '520%'] }}
            transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.6, ease: 'easeInOut' }}
          />
        </>
      ) : (
        <span className="absolute inset-0 flex items-center justify-center px-6 text-center text-[17px] leading-6 font-semibold tracking-tight">
          {copy.timeline[phase]}
        </span>
      )}

      <span className="sr-only">{copy.timeline.banner}</span>
    </motion.button>
  )
}
