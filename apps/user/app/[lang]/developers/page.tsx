import type { ResolvingMetadata } from 'next'
import { DevelopersShow } from '@/features/developers/DevelopersShow'
import { MEMBERS } from '@/features/developers/members'
import { DuskBackground } from '@/shared/background/DuskBackground'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'
import { localePath } from '@/shared/i18n/paths'
import { shareMetadata } from '@/shared/metadata/share-metadata'
import { PageTitle } from '@/shared/page-title/PageTitle'

/** 공유 카드에 페이지 이름과 소개 문구를 싣는다 */
export async function generateMetadata(
  _: PageProps<'/[lang]/developers'>,
  parent: ResolvingMetadata,
) {
  const locale = await getLocale()
  const { pages, developers, meta } = getMessages(locale)
  return shareMetadata(parent, {
    title: meta.pageTitle.replace('{page}', pages.developers),
    description: developers.description,
    path: localePath(locale, '/developers'),
  })
}

/** 개발진 소개. 홈 크레딧에서 한 단계 들어오는 페이지라 도크는 뒤로 가기 원이 된다 */
export default async function DevelopersPage() {
  const { pages, developers, home } = getMessages(await getLocale())

  return (
    <>
      {/* 밝은 노을 위에서 별자리 이름이 묻혀 이 페이지만 하늘을 가라앉힌다 */}
      <DuskBackground skyOpacity={0.65} />
      <DevelopersShow
        title={<PageTitle title={pages.developers} />}
        organization={home.credits.likelion}
        members={MEMBERS}
        departments={developers.departments}
      />
    </>
  )
}
