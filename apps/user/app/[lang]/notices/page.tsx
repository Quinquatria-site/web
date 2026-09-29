import { MOCK_NOTICES } from '@/features/notices/mock-notices'
import { NoticeCard } from '@/features/notices/NoticeCard'
import { PageHeader } from '@/shared/header/PageHeader'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'

/** 공지 탭. 상단 고정 공지를 먼저, 일반 공지를 뒤에 카드로 쌓는다 */
export default async function NoticesPage() {
  const { pages } = getMessages(await getLocale())
  // API 를 붙이면 여기서 받아 온다
  const notices = MOCK_NOTICES

  return (
    <>
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
