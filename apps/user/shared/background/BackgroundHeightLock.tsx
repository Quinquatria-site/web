'use client'

import { useEffect } from 'react'

/** 배경 높이를 px 로 잠가 <html> 의 --background-height 에 넣는다. iOS 크롬처럼 키보드가 웹뷰를 줄이면 lvh 도 줄어 아래에 붙은 노을이 딸려 올라와서, 높이만 바뀐 resize 는 지금까지 본 가장 큰 값만 받고 폭이 바뀔 때만 새로 잰다 */
export function BackgroundHeightLock() {
  useEffect(() => {
    const root = document.documentElement
    let width = window.innerWidth
    let height = 0
    const write = (next: number) => {
      height = next
      root.style.setProperty('--background-height', `${next}px`)
    }
    write(window.innerHeight)
    const onResize = () => {
      // 폭이 같으면 주소창이 접혀 화면이 커질 때만 따라가고, 키보드로 줄어드는 건 무시한다
      if (window.innerWidth === width) {
        if (window.innerHeight > height) write(window.innerHeight)
        return
      }
      width = window.innerWidth
      write(window.innerHeight)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      root.style.removeProperty('--background-height')
    }
  }, [])
  return null
}
