'use client'

import { useEffect, useRef, useState } from 'react'
import { DockSentinel } from '@/shared/dock/DockSentinel'
import { LandingScrollCue } from './LandingScrollCue'
import { LandingTitle, TITLE_REVEAL_SECONDS } from './LandingTitle'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useLockedViewportHeight } from './useLockedViewportHeight'

/** 홈 랜딩. 영상이 멈추는 순간 제목이 다 펼쳐지도록 끝나기 전부터 드러낸다. 자동재생이 막히면 마지막 장면 포스터 위에 바로 드러낸다 */
export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [done, setDone] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [titleLag, setTitleLag] = useState<number | null>(null)

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
    setTitleLag(0)
  }

  const startTitleBeforeEnd = (video: HTMLVideoElement) => {
    if (titleLag !== null) return
    // timeupdate 는 0.25초 간격이라 문턱을 넘은 만큼 애니메이션을 앞당겨 영상과 같은 순간에 끝낸다
    const lag = video.currentTime - (video.duration - TITLE_REVEAL_SECONDS)
    if (lag >= 0) setTitleLag(lag)
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    // 하이드레이션 전에 이미 끝났을 수 있어 다시 틀지 않는다
    if (video.ended) {
      setDone(true)
      setTitleLag(0)
      return
    }
    // autoPlay 는 막혀도 조용히 실패하므로 play() 거절로 저전력 모드 등을 감지한다
    video.play().catch(showEnd)
  }, [])

  useLockedViewportHeight(sectionRef)

  return (
    // dvh 는 모바일 주소창이 오갈 때마다 높이가 바뀌어 그림이 확대·축소되고 아래가 밀려, 잰 높이가 들어오기 전엔 svh 로 둔다
    // 제목이 앱 폭 비율로 크기를, 영상이 깔린 자리로 높이를 잡도록 폭·높이를 다 재는 컨테이너로 둔다
    <section
      ref={sectionRef}
      className="relative h-(--locked-vh,100svh) overflow-hidden [container-type:size]"
    >
      {/* muted·playsInline 이 없으면 iOS 가 자동재생을 막거나 전체화면으로 연다 */}
      <video
        ref={videoRef}
        className="absolute inset-0 size-full object-cover"
        src="/landing-v3.mp4"
        poster={blocked ? '/landing-v3-end.jpg' : '/landing-v3-start.jpg'}
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden
        onTimeUpdate={(e) => startTitleBeforeEnd(e.currentTarget)}
        onEnded={() => setDone(true)}
        onError={showEnd}
      />
      {/* 아래 바로가기 면과 경계선이 보이지 않게 영상 끝을 같은 색으로 번지게 한다 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[200px] bg-linear-to-b from-transparent to-secondary"
      />
      <LandingTitle lag={titleLag} />
      <LanguageSwitcher />
      {done && <LandingScrollCue onPress={scrollPastLanding} />}
      {/* 랜딩을 절반 넘게 내리면 위로 가기 원이 뜨도록 가운데에 감지 표시를 둔다 */}
      <div className="absolute top-1/2">
        <DockSentinel />
      </div>
    </section>
  )
}
