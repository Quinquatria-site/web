import type { ResolvingMetadata } from 'next'
import { ONLINE_CONTENTS } from '@/features/online/online-contents'
import { OnlineContentCard } from '@/features/online/OnlineContentCard'
import { DuskBackground } from '@/shared/background/DuskBackground'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'
import { listShareMetadata } from '@/shared/metadata/share-metadata'
import { PageTitle } from '@/shared/page-title/PageTitle'

/** 공유 카드에 페이지 이름과 소개 문구를 싣는다 */
export async function generateMetadata(_: PageProps<'/[lang]/online'>, parent: ResolvingMetadata) {
  return listShareMetadata(parent, await getLocale(), 'online', '/online')
}

/** 온라인 콘텐츠. 홈에서 한 단계 들어오는 페이지라 도크는 뒤로 가기 원이 된다 */
export default async function OnlinePage() {
  const { pages, online } = getMessages(await getLocale())

  return (
    <>
      <DuskBackground />
      <PageTitle title={pages.online} />
      <ul className="flex flex-col gap-3 px-5 pt-4">
        {ONLINE_CONTENTS.map(({ key, href }) => (
          <li key={key}>
            <OnlineContentCard href={href} {...online.items[key]} />
          </li>
        ))}
      </ul>
    </>
  )
}
