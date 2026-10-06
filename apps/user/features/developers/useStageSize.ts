import { useEffect, useState, type RefObject } from 'react'

/** 무대 칸의 폭과 높이. 별 점 좌표가 높이 비율이라 주소창이 접혀 높이가 바뀔 때마다 다시 읽는다 */
export function useStageSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const stage = ref.current
    if (!stage) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    observer.observe(stage)
    return () => observer.disconnect()
  }, [ref])

  return size
}
