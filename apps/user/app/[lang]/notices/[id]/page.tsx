import { notFound } from 'next/navigation'
import { getNotice, getNotices } from '@/features/notices/get-notices'
import { NoticeDetail } from '@/features/notices/NoticeDetail'
import { LightBackground } from '@/shared/background/LightBackground'
import { PageHeader } from '@/shared/header/PageHeader'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'

/** 목록에 있는 공지 id 로 정적 생성한다. 언어는 레이아웃이 곱한다 */
export async function generateStaticParams() {
  const notices = await getNotices()
  return notices.map(({ id }) => ({ id: String(id) }))
}

/** 빌드 뒤에 올라온 공지도 첫 요청 때 굽고 캐시한다. 재검증은 이미 있는 페이지만 다시 굽기 때문이다 */
export const dynamicParams = true

/** 공지 상세 */
export default async function NoticeDetailPage({ params }: PageProps<'/[lang]/notices/[id]'>) {
  const { id } = await params
  const { pages } = getMessages(await getLocale())
  // 숫자가 아닌 주소는 API 가 422 로 답해 500 이 되므로 부르기 전에 걸러 낸다
  if (!/^\d+$/.test(id)) notFound()
  const notice = await getNotice(Number(id))
  if (!notice) notFound()

  return (
    <>
      <LightBackground />
      <PageHeader title={pages.notices} />
      <NoticeDetail notice={notice} />
    </>
  )
}
