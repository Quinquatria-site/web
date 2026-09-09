import { notFound } from 'next/navigation'
import { NoticeDetail } from '@/domains/notice/components/notice-detail'
import { noticeById } from '@/domains/notice/libs/notices'
import { NOTICES } from '@/mocks/notices'

// 목 데이터에 있는 공지만 굽는다. 나머지 주소는 404.
export function generateStaticParams() {
  return NOTICES.map((notice) => ({ id: notice.id }))
}

export const dynamicParams = false

export default async function Page({ params }: PageProps<'/[lang]/notice/[id]'>) {
  const { id } = await params
  const notice = noticeById(id)
  if (!notice) notFound()

  return <NoticeDetail notice={notice} />
}
