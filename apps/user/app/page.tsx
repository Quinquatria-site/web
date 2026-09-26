import { HomeCredits } from '@/components/home-credits/HomeCredits'
import { HomeNav } from '@/components/home-nav/HomeNav'
import { LandingHero } from '@/components/landing/LandingHero'

/** 홈. 랜딩 영상 · 메인 탭 바로가기 · 크레딧을 차례로 쌓는다 */
export default function Home() {
  return (
    <>
      <LandingHero />
      <HomeNav />
      <HomeCredits />
    </>
  )
}
