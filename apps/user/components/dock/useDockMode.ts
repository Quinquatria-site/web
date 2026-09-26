'use client'

import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'
import { getDockMode } from './dock-mode'
import { landingStore } from './landing-store'

export function useDockMode() {
  const pathname = usePathname()
  const pastLanding = useSyncExternalStore(landingStore.subscribe, landingStore.get, () => false)
  return getDockMode(pathname, pastLanding)
}
