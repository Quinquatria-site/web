import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'

/** 데이터 연결 전이라 목 id 로만 정적 생성한다. 언어는 레이아웃이 세 가지로 곱한다 */
export function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }]
}

/** 목록에 없는 id 는 런타임에 만들지 않고 404 로 보낸다 */
export const dynamicParams = false

/** 분실물 상세 */
export default async function LostItemDetailPage({ params }: PageProps<'/[lang]/lost-items/[id]'>) {
  const { id } = await params
  const { pages } = getMessages(await getLocale())
  return (
    <h1>
      {pages.lostItemDetail} {id}
    </h1>
  )
}
