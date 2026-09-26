'use client'

import { useEffect } from 'react'
import { useDockMode } from './useDockMode'

/** 앱 전체에 하나만 떠 있는 도크. 모드에 따라 원 또는 탭바 자리를 잡는다 */
export function Dock() {
  const mode = useDockMode()

  useEffect(() => {
    // 본문 끝 여백이 CSS 만으로 모드를 따라가게 html 에 적는다
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
