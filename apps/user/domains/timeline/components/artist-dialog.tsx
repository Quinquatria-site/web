'use client'

import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useLang } from '@/components/lang-provider'
import type { Artist } from '@/mocks/types'
import { timeRange } from '../libs/schedule'

const POP = { type: 'spring', stiffness: 520, damping: 34, mass: 0.7 } as const

export function ArtistDialog({ artist, onClose }: { artist: Artist | null; onClose: () => void }) {
  const { lang, copy } = useLang()
  // 닫히는 동안에도 내용이 남아 있어야 해서 마지막으로 연 항목을 들고 있는다
  const [shown, setShown] = useState<Artist | null>(artist)
  if (artist && artist !== shown) setShown(artist)

  useEffect(() => {
    if (!artist) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [artist, onClose])

  return (
    <AnimatePresence>
      {artist && shown && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 z-[1200] flex items-center justify-center bg-ink/45 px-5 backdrop-blur-[2px]"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={shown.name[lang]}
            initial={{ scale: 0.94, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 8 }}
            transition={POP}
            onClick={(event) => event.stopPropagation()}
            className="relative flex max-h-[80%] w-full gap-4 overflow-y-auto overscroll-contain rounded-3xl border border-line bg-surface p-5 shadow-[0_12px_40px_rgba(28,14,2,0.24)]"
          >
            <div className="relative aspect-3/4 w-[42%] shrink-0 self-start overflow-hidden rounded-2xl bg-surface-muted">
              <Image src={shown.image} alt="" fill sizes="200px" className="object-cover" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="pr-9 text-xl leading-7 font-semibold tracking-tight">
                {shown.name[lang]}
              </h2>
              <p className="mt-1 text-[13px] leading-5 text-ink-muted tabular-nums">
                {timeRange(shown)} · {shown.place[lang]}
              </p>
              <p className="mt-3 text-[13px] leading-6 text-ink-muted">{shown.intro[lang]}</p>
            </div>

            <button
              type="button"
              aria-label={copy.timeline.close}
              onClick={onClose}
              className="absolute top-4 right-4 flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-ink-muted"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                className="size-4"
                aria-hidden
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
