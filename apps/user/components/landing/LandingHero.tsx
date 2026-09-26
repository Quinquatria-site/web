'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

/** 홈 랜딩. 영상이 끝나거나 자동재생이 막히면 같은 장면의 고화질 이미지로 크로스페이드한다 */
export function LandingHero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showStill, setShowStill] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    // 하이드레이션 전에 이미 끝났을 수 있어 다시 틀지 않는다
    if (video.ended) {
      setShowStill(true)
      return
    }
    // autoPlay 는 막혀도 조용히 실패하므로 play() 거절로 저전력 모드 등을 감지한다
    video.play().catch(() => setShowStill(true))
  }, [])

  return (
    <section className="relative h-dvh overflow-hidden">
      {/* muted·playsInline 이 없으면 iOS 가 자동재생을 막거나 전체화면으로 연다 */}
      <video
        ref={videoRef}
        className="absolute inset-0 size-full object-cover"
        src="/landing.mp4"
        poster="/landing-poster.jpg"
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden
        onEnded={() => setShowStill(true)}
        onError={() => setShowStill(true)}
      />
      {/* 영상이 끝나는 순간 바로 보이도록 lazy 대신 처음부터 받아 둔다 */}
      <Image
        className={`object-cover transition-opacity duration-500 ${showStill ? 'opacity-100' : 'opacity-0'}`}
        src="/home.png"
        alt="HUFS 2026 QUINQUATRIA TWILIGHT, 10월 7일~8일"
        fill
        sizes="(max-width: 480px) 100vw, 480px"
        loading="eager"
      />
    </section>
  )
}
