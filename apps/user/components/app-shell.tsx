'use client'

import { LiquidGlassEnvironment } from './liquid-glass-environment'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ShellContext, type DockPhase } from '@/hooks/use-shell'

export function AppShell({ children, nav }: { children: ReactNode; nav: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const homeAnchorRef = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const [dock, setDock] = useState<{ path: string; phase: DockPhase }>({
    path: pathname,
    phase: 'landing',
  })

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [pathname])

  const setDockPhase = useCallback(
    (phase: DockPhase) =>
      setDock((current) =>
        current.path === pathname && current.phase === phase ? current : { path: pathname, phase },
      ),
    [pathname],
  )

  const value = useMemo(
    () => ({
      scrollRef,
      homeAnchorRef,
      dockPhase: dock.path === pathname ? dock.phase : 'landing',
      setDockPhase,
    }),
    [dock, pathname, setDockPhase],
  )

  return (
    <ShellContext value={value}>
      <LiquidGlassEnvironment>
        <div ref={scrollRef} className="h-full overflow-y-auto overscroll-contain">
          {children}
        </div>
        {nav}
      </LiquidGlassEnvironment>
    </ShellContext>
  )
}
