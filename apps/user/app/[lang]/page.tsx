import type { ResolvingMetadata } from 'next'
import { HomeCredits } from '@/features/home/credits/HomeCredits'
import { HomeNav } from '@/features/home/nav/HomeNav'
import { LandingHero } from '@/features/home/landing/LandingHero'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'
import { localePath } from '@/shared/i18n/paths'
import { shareMetadata } from '@/shared/metadata/share-metadata'

/** 공유 카드에 축제 이름과 날짜·장소를 싣는다 */
export async function generateMetadata(_: PageProps<'/[lang]'>, parent: ResolvingMetadata) {
  const locale = await getLocale()
  const { meta } = getMessages(locale)
  return shareMetadata(parent, {
    title: meta.siteTitle,
    description: meta.siteDescription,
    path: localePath(locale, '/'),
  })
}

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
