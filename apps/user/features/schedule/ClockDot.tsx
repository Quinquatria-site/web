'use client'

import { useEffect, useState } from 'react'
import { TimelineDot } from './TimelineDot'

/** 고정 일정 줄의 점. 미리 그린 페이지는 지금 시각을 몰라 브라우저에서 1분마다 재고, start 이후 end 전이면 켠다 */
export function ClockDot({ start, end }: { start: number; end: number | null }) {
  // 첫 렌더는 서버가 그린 화면과 같게 꺼 두고, 붙은 뒤에 잰다
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    const tick = () => setNow(Date.now())
    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])
  return <TimelineDot active={now !== null && end !== null && now >= start && now < end} />
}
