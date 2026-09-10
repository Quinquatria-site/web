'use client'

import { motion } from 'motion/react'
import { useLang } from '@/components/lang-provider'

export function MapLoading() {
  const { copy } = useLang()

  return (
    <motion.div
      role="status"
      aria-live="polite"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="absolute inset-0 z-[1200] overflow-hidden"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-2.5 rounded-pill border border-line bg-surface-muted px-4 py-2.5">
          <span className="size-4 animate-spin rounded-pill border-2 border-line border-t-accent motion-reduce:animate-none" />
          <span className="text-[13px] font-medium text-ink-muted">{copy.map.loading}</span>
        </div>
      </div>
    </motion.div>
  )
}
