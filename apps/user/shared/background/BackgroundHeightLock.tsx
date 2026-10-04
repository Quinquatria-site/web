'use client'

import { useEffect } from 'react'

/** 배경 높이를 100lvh 의 px 값으로 잠가 <html> 의 --background-height 에 넣는다. iOS 크롬은 키보드가 웹뷰를 줄여 lvh 도 줄어 아래에 붙은 노을 그림이 딸려 올라와서, 줄어드는 건 무시하고 커질 때와 폭이 바뀔 때만 다시 잰다 */
export function BackgroundHeightLock() {
  useEffect(() => {
    const root = document.documentElement
    // lvh 는 주소창이 오가도 그대로인 가장 큰 화면 높이라, innerHeight 대신 이 값을 재야 스크롤 때 배경이 덜컹이지 않는다
    const probe = document.createElement('div')
    probe.style.cssText =
      'position:fixed;top:0;height:100lvh;width:0;visibility:hidden;pointer-events:none'
    document.body.append(probe)
    let width = window.innerWidth
    let height = 0
    const write = (next: number) => {
      height = next
      root.style.setProperty('--background-height', `${next}px`)
    }
    write(probe.offsetHeight)
    const onResize = () => {
      if (window.innerWidth !== width) {
        width = window.innerWidth
        return write(probe.offsetHeight)
      }
      // 인앱 브라우저처럼 웹뷰가 커지는 건 따라가고, 키보드로 줄어드는 건 무시한다
      if (probe.offsetHeight > height) write(probe.offsetHeight)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      probe.remove()
      root.style.removeProperty('--background-height')
    }
  }, [])
  return null
}
