'use client'

import { useEffect, useRef, useState } from 'react'
import { DockSentinel } from '@/shared/dock/DockSentinel'
import { LandingScrollCue } from './LandingScrollCue'

/** 홈 랜딩. 영상을 한 번 틀고 마지막 장면에 멈춘다. 자동재생이 막히면 마지막 장면을 포스터로 보여 준다 */
export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [done, setDone] = useState(false)
  const [blocked, setBlocked] = useState(false)

  const scrollPastLanding = () => {
    const section = sectionRef.current
    if (!section) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollBy({
      top: section.getBoundingClientRect().bottom,
      behavior: reduced ? 'auto' : 'smooth',
    })
  }

  const showEnd = () => {
    setBlocked(true)
    setDone(true)
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    // 하이드레이션 전에 이미 끝났을 수 있어 다시 틀지 않는다
    if (video.ended) {
      setDone(true)
      return
    }
    // autoPlay 는 막혀도 조용히 실패하므로 play() 거절로 저전력 모드 등을 감지한다
    video.play().catch(showEnd)
  }, [])

  return (
    // dvh 는 모바일 주소창이 오갈 때마다 높이가 바뀌어 그림이 확대·축소되고 아래가 밀려 svh 로 고정한다
    <section ref={sectionRef} className="relative h-svh overflow-hidden">
      {/* muted·playsInline 이 없으면 iOS 가 자동재생을 막거나 전체화면으로 연다 */}
      <video
        ref={videoRef}
        className="absolute inset-0 size-full object-cover"
        src="/landing-v2.mp4"
        poster={blocked ? '/landing-v2-end.jpg' : '/landing-v2-start.jpg'}
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-label="HUFS 2026 QUINQUATRIA TWILIGHT"
        onEnded={() => setDone(true)}
        onError={showEnd}
      />
      {done && <LandingScrollCue onPress={scrollPastLanding} />}
      {/* 랜딩을 절반 넘게 내리면 위로 가기 원이 뜨도록 가운데에 감지 표시를 둔다 */}
      <div className="absolute top-1/2">
        <DockSentinel />
      </div>
    </section>
  )
}
