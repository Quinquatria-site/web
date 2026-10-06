import { useMotionValue, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import { useEffect, useState, type RefObject } from 'react'
import { clamp01, phases } from './scene'

/** 감싼 칸의 스크롤 진행을 별자리→카드 전환(enter)과 카드 넘김(cards)으로 나누고, 그에 따른 상태를 함께 준다 */
export function useShowProgress(
  wrapRef: RefObject<HTMLElement | null>,
  pinRef: RefObject<HTMLElement | null>,
  count: number,
) {
  const { scrollY } = useScroll()
  const start = useMotionValue(0)
  const length = useMotionValue(1)

  // 창 높이로 나누면 iOS 툴바가 방향 바꿀 때마다 들락거려 카드가 튀어서, svh 로 고정된 칸 높이로만 길이를 잰다
  useEffect(() => {
    const wrap = wrapRef.current
    const pin = pinRef.current
    if (!wrap || !pin) return
    const observer = new ResizeObserver(() => {
      start.set(wrap.getBoundingClientRect().top + window.scrollY)
      length.set(Math.max(1, wrap.offsetHeight - pin.offsetHeight))
    })
    observer.observe(wrap)
    observer.observe(pin)
    return () => observer.disconnect()
  }, [wrapRef, pinRef, start, length])

  const progress = useTransform([scrollY, start, length], ([y, s, l]: number[]) =>
    clamp01((y - s) / l),
  )
  const enter = useTransform(progress, (p) => phases(p, count).enter)
  const cards = useTransform(progress, (p) => phases(p, count).cards)

  // 별자리 글자가 다 지워지면 둥실대는 반복을 멈춰 카드를 넘기는 동안 JS 가 매 프레임 돌지 않게 한다
  const [introGone, setIntroGone] = useState(false)
  useMotionValueEvent(enter, 'change', (e) => setIntroGone(e >= 0.4))

  // 가운데 온 적 있는 카드까지 글자를 띄운다. 넘기는 방향은 한쪽이라 가장 먼 번호만 들고 있으면 된다
  const [reached, setReached] = useState(-1)
  useMotionValueEvent(progress, 'change', (p) => {
    const { enter, cards } = phases(p, count)
    if (enter > 0.97) setReached((prev) => Math.max(prev, Math.round(cards * (count - 1))))
  })

  return { enter, cards, introGone, reached }
}
