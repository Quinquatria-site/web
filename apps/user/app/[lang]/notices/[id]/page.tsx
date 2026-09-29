import { notFound } from 'next/navigation'
import { MOCK_NOTICES } from '@/features/notices/mock-notices'
import { NoticeDetail } from '@/features/notices/NoticeDetail'
import { PageHeader } from '@/shared/header/PageHeader'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'

/** 데이터 연결 전이라 더미 id 로만 정적 생성한다. 언어는 레이아웃이 세 가지로 곱한다 */
export function generateStaticParams() {
  return MOCK_NOTICES.map(({ id }) => ({ id: String(id) }))
}

/** 목록에 없는 id 는 런타임에 만들지 않고 404 로 보낸다 */
export const dynamicParams = false

/** 공지 상세 */
export default async function NoticeDetailPage({ params }: PageProps<'/[lang]/notices/[id]'>) {
  const { id } = await params
  const { pages } = getMessages(await getLocale())
  const notice = MOCK_NOTICES.find((n) => String(n.id) === id)
  if (!notice) notFound()

  return (
    <>
      <PageHeader title={pages.notices} />
      <NoticeDetail notice={notice} />
    </>
  )
}
