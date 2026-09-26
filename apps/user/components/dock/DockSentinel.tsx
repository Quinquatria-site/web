'use client'

import { useEffect, useRef } from 'react'
import { landingStore } from './landing-store'

export function DockSentinel() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      landingStore.set(entry.boundingClientRect.top < 0)
    })
    observer.observe(el)
    return () => {
      observer.disconnect()
      landingStore.set(false)
    }
  }, [])

  return <div ref={ref} aria-hidden />
}
