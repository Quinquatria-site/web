import { notFound } from 'next/navigation'
import { DUMMY_LOST_ITEMS } from '@/features/lost-items/dummy-lost-items'
import { LostItemDetail } from '@/features/lost-items/LostItemDetail'
import { PageHeader } from '@/shared/header/PageHeader'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'

/** 목록과 같은 더미 id 로 정적 생성한다. 분실물이 올라오면 getLostItems() 의 id 로 바꾼다. 언어는 레이아웃이 곱한다 */
export function generateStaticParams() {
  return DUMMY_LOST_ITEMS.map(({ id }) => ({ id: String(id) }))
}

/** 목록에 없는 id 는 런타임에 만들지 않고 404 로 보낸다 */
export const dynamicParams = false

/** 분실물 상세 */
export default async function LostItemDetailPage({ params }: PageProps<'/[lang]/lost-items/[id]'>) {
  const { id } = await params
  const { pages, lostItems } = getMessages(await getLocale())
  // 분실물이 올라오면 getLostItem(Number(id)) 로 바꾼다
  const item = DUMMY_LOST_ITEMS.find((lostItem) => String(lostItem.id) === id)
  if (!item) notFound()

  return (
    <>
      <PageHeader title={pages.lostItems} />
      <LostItemDetail
        item={item}
        foundLocationLabel={lostItems.foundLocation}
        returnedLabel={lostItems.returned}
      />
    </>
  )
}
