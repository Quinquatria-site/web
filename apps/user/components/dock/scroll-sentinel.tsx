'use client'

import { useEffect, useRef } from 'react'
import { useShell } from '@/hooks/use-shell'

export function ScrollSentinel({
  className,
  onChange,
}: {
  className?: string
  onChange: (passed: boolean) => void
}) {
  // 스크롤 주체는 문서가 아니라 셸 안쪽 컬럼이다
  const { scrollRef } = useShell()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    const root = scrollRef.current
    // 첫 렌더에서 둘 중 하나라도 없으면 다음 렌더를 기다린다
    if (!el || !root) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 스크롤 영역의 윗변 좌표
        const rootTop = entry.rootBounds?.top ?? 0
        // 안 보이는 이유가 "아직 아래" 가 아니라 "위로 지나감" 일 때만 참
        onChange(!entry.isIntersecting && entry.boundingClientRect.top < rootTop)
      },
      // 스크롤 이벤트 대신 브라우저가 교차 여부만 통지한다
      { root, threshold: 0 },
    )
    observer.observe(el)
    // 화면을 떠나면 관찰을 끊는다
    return () => observer.disconnect()
    // onChange 는 호출부에서 useCallback 으로 고정해야 재구독되지 않는다
  }, [scrollRef, onChange])

  // 높이 0 에 absolute 라 레이아웃에 영향을 주지 않고, 위치는 className 이 정한다
  return (
    <div ref={ref} aria-hidden className={`pointer-events-none absolute h-0 ${className ?? ''}`} />
  )
}
