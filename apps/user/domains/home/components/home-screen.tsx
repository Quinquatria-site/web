'use client'

import { useCallback } from 'react'
import { ScrollSentinel } from '@/components/dock/scroll-sentinel'
import { useShell } from '@/hooks/use-shell'
import { LandingSection } from './landing-section'

export function HomeScreen() {
  const { setDockPhase, homeAnchorRef } = useShell()

  const onLandingSentinel = useCallback(
    (passed: boolean) => setDockPhase(passed ? 'scrolled' : 'landing'),
    [setDockPhase],
  )

  return (
    <>
      <section className="relative h-full border-b border-line">
        <LandingSection />
        <ScrollSentinel className="top-8 right-0 left-0" onChange={onLandingSentinel} />
      </section>

      <section
        ref={homeAnchorRef}
        className="flex h-full items-center justify-center border-b border-line"
      >
        <span className="text-sm text-ink-muted">더미 섹션 1</span>
      </section>

      <section className="flex h-full items-center justify-center">
        <span className="text-sm text-ink-muted">더미 섹션 2</span>
      </section>
    </>
  )
}
