'use client'

import { useEffect, useRef } from 'react'
import { landingStore } from './landing-store'

/** 홈 랜딩 안의 보이지 않는 표시. 화면 위로 지나가면 위로 가기 원을 띄운다 */
export function DockSentinel() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      // 아직 아래에 있어 안 보이는 경우와 구분하려고 위로 지나갔을 때만 true
      landingStore.set(entry.boundingClientRect.top < 0)
    })
    observer.observe(el)
    return () => {
      observer.disconnect()
      // 홈을 떠나면 초기화해야 다시 돌아왔을 때 랜딩부터 시작한다
      landingStore.set(false)
    }
  }, [])

  return <div ref={ref} aria-hidden />
}
