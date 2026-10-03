import type { ResolvingMetadata } from 'next'
import { getNotices } from '@/features/notices/get-notices'
import { NoticeCard } from '@/features/notices/NoticeCard'
import { DuskBackground } from '@/shared/background/DuskBackground'
import { PageHeader } from '@/shared/header/PageHeader'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'
import { listShareMetadata } from '@/shared/metadata/share-metadata'

/** 공유 카드에 페이지 이름과 소개 문구를 싣는다 */
export async function generateMetadata(_: PageProps<'/[lang]/notices'>, parent: ResolvingMetadata) {
  return listShareMetadata(parent, await getLocale(), 'notices', '/notices')
}

/** 공지 탭. 상단 고정 공지를 먼저, 일반 공지를 뒤에 카드로 쌓는다 */
export default async function NoticesPage() {
  const { pages } = getMessages(await getLocale())
  const notices = await getNotices()

  return (
    <>
      <DuskBackground />
      <PageHeader title={pages.notices} />
      <ul className="flex flex-col gap-3 px-5 pt-4">
        {notices.map((notice) => (
          <li key={notice.id}>
            <NoticeCard notice={notice} />
          </li>
        ))}
      </ul>
    </>
  )
}
