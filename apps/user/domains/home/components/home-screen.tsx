'use client'

import { useEffect, useRef } from 'react'
import { useShell, type DockPhase } from '@/hooks/use-shell'
import { LandingSection } from './landing-section'
import { NavSection } from './nav-section'

export function HomeScreen() {
  const { setDockPhase, homeAnchorRef, scrollRef } = useShell()
  const previousPhaseRef = useRef<DockPhase | null>(null)

  useEffect(() => {
    const root = scrollRef.current
    if (!root) return

    // 구독이 바뀌면 현재 위치를 한 번 동기화하고, 이후에는 경계를 넘을 때만 갱신한다.
    previousPhaseRef.current = null
    const updatePhase = () => {
      const phase = root.scrollTop > 0 ? 'scrolled' : 'landing'
      if (previousPhaseRef.current === phase) return

      previousPhaseRef.current = phase
      setDockPhase(phase)
    }
    updatePhase()
    root.addEventListener('scroll', updatePhase, { passive: true })
    return () => root.removeEventListener('scroll', updatePhase)
  }, [scrollRef, setDockPhase])

  return (
    <>
      <section className="relative h-full border-b border-line">
        <LandingSection />
      </section>

      <NavSection ref={homeAnchorRef} />
    </>
  )
}
