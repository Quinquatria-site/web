'use client'

import { useCallback } from 'react'
import { ScrollSentinel } from '@/components/dock/scroll-sentinel'
import { useShell } from '@/hooks/use-shell'
import { PAGE_ITEMS } from '@/libs/routes'
import { LandingSection } from './landing-section'
import { PreviewSection } from './preview-section'

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

      {PAGE_ITEMS.map((item, index) => (
        <PreviewSection key={item.href} item={item} ref={index === 0 ? homeAnchorRef : undefined} />
      ))}
    </>
  )
}
