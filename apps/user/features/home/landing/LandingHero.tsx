'use client'

import { useEffect, useRef, useState } from 'react'
import { DockSentinel } from '@/shared/dock/DockSentinel'
import { LandingScrollCue } from './LandingScrollCue'
import { LandingTitle } from './LandingTitle'

/** 홈 랜딩. 영상을 한 번 틀고 마지막 장면에 멈춘 뒤 제목을 드러낸다. 자동재생이 막히면 마지막 장면 포스터 위에 바로 드러낸다 */
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
    // 제목이 앱 폭 비율로 크기를 잡도록 컨테이너로 둔다
    <section ref={sectionRef} className="@container relative h-svh overflow-hidden">
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
        aria-hidden
        onEnded={() => setDone(true)}
        onError={showEnd}
      />
      {/* 아래 바로가기 면과 경계선이 보이지 않게 영상 끝을 같은 색으로 번지게 한다 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[200px] bg-linear-to-b from-transparent to-secondary"
      />
      <LandingTitle shown={done} />
      {done && <LandingScrollCue onPress={scrollPastLanding} />}
      {/* 랜딩을 절반 넘게 내리면 위로 가기 원이 뜨도록 가운데에 감지 표시를 둔다 */}
      <div className="absolute top-1/2">
        <DockSentinel />
      </div>
    </section>
  )
}
