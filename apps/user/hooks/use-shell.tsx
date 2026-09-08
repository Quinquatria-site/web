'use client'

import { createContext, useContext, type RefObject } from 'react'

export type DockPhase = 'landing' | 'scrolled'

export type ShellValue = {
  scrollRef: RefObject<HTMLDivElement | null>
  homeAnchorRef: RefObject<HTMLElement | null>
  dockPhase: DockPhase
  setDockPhase: (phase: DockPhase) => void
}

export const ShellContext = createContext<ShellValue | null>(null)

export function useShell() {
  const value = useContext(ShellContext)
  if (!value) throw new Error('useShell 은 AppShell 안에서만 쓸 수 있다')
  return value
}
