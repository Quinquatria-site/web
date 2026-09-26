'use client'

import { useEffect } from 'react'
import { useDockMode } from './useDockMode'

export function Dock() {
  const mode = useDockMode()

  useEffect(() => {
    document.documentElement.dataset.dock = mode
  }, [mode])

  if (mode === 'hidden') return null

  return (
    <nav
      data-mode={mode}
      className={`outline outline-black -outline-offset-1 fixed right-(--dock-right) bottom-(--dock-bottom) h-(--dock-size) ${
        mode === 'tabs' ? 'w-(--dock-bar-width)' : 'w-(--dock-size)'
      }`}
    />
  )
}
