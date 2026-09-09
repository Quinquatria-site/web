'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useLang } from '@/components/lang-provider'

const GRID = {
  backgroundImage:
    'linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)',
  backgroundSize: '56px 56px',
}

const DOTS = [
  { left: '26%', top: '30%', size: 24, radius: '9999px', delay: '0ms' },
  { left: '61%', top: '41%', size: 20, radius: '7px', delay: '160ms' },
  { left: '38%', top: '58%', size: 24, radius: '9999px', delay: '320ms' },
  { left: '72%', top: '67%', size: 20, radius: '9999px', delay: '480ms' },
]

export function MapLoading() {
  const { copy } = useLang()
  const reduce = useReducedMotion()

  return (
    <motion.div
      role="status"
      aria-live="polite"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="absolute inset-0 z-[1200] overflow-hidden bg-surface-muted"
    >
      <div className="absolute inset-0 opacity-60" style={GRID} />

      {DOTS.map((dot) => (
        <span
          key={dot.left}
          className="absolute animate-pulse bg-line motion-reduce:animate-none"
          style={{
            left: dot.left,
            top: dot.top,
            width: dot.size,
            height: dot.size,
            borderRadius: dot.radius,
            animationDelay: dot.delay,
          }}
        />
      ))}

      {!reduce && (
        <motion.div
          aria-hidden
          className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-surface/85 to-transparent"
          animate={{ x: ['-110%', '310%'] }}
          transition={{ duration: 1.7, ease: 'linear', repeat: Infinity }}
        />
      )}

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-2.5 rounded-full border border-line bg-surface/85 px-4 py-2.5 backdrop-blur-sm">
          <span className="size-4 animate-spin rounded-full border-2 border-line border-t-accent motion-reduce:animate-none" />
          <span className="text-[13px] font-medium text-ink-muted">{copy.map.loading}</span>
        </div>
      </div>
    </motion.div>
  )
}
