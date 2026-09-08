'use client'

import { useCallback } from 'react'
import { ScrollSentinel } from '@/components/dock/scroll-sentinel'
import { useShell } from '@/hooks/use-shell'
import { LandingSection } from './landing-section'

export function HomeScreen() {
  const { setDockPhase, homeAnchorRef } = useShell()

  const onArrowSentinel = useCallback(
    (passed: boolean) => setDockPhase(passed ? 'top' : 'logo'),
    [setDockPhase],
  )

  return (
    <>
      <section className="h-full border-b border-line">
        <LandingSection />
      </section>

      <section
        ref={homeAnchorRef}
        className="relative flex h-full items-center justify-center border-b border-line"
      >
        <ScrollSentinel className="top-24 right-0 left-0" onChange={onArrowSentinel} />
        <span className="text-sm text-ink-muted">더미 섹션 1</span>
      </section>

      <section className="flex h-full items-center justify-center">
        <span className="text-sm text-ink-muted">더미 섹션 2</span>
      </section>
    </>
  )
}
