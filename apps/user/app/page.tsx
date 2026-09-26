import { HomeNav } from '@/components/home-nav/HomeNav'
import { LandingHero } from '@/components/landing/LandingHero'

/** 홈. 랜딩 영상 아래에 메인 탭 바로가기를 둔다 */
export default function Home() {
  return (
    <>
      <LandingHero />
      <HomeNav />
    </>
  )
}
