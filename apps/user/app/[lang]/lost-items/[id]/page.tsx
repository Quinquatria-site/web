import { getLostItem, getLostItems } from '@/features/lost-items/get-lost-items'
import { LostItemDetail } from '@/features/lost-items/LostItemDetail'
import { PageHeader } from '@/shared/header/PageHeader'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'

/** 목록에 있는 분실물 id 로 정적 생성한다. 언어는 레이아웃이 곱한다 */
export async function generateStaticParams() {
  const items = await getLostItems()
  return items.map(({ id }) => ({ id: String(id) }))
}

/** 목록에 없는 id 는 런타임에 만들지 않고 404 로 보낸다 */
export const dynamicParams = false

/** 분실물 상세 */
export default async function LostItemDetailPage({ params }: PageProps<'/[lang]/lost-items/[id]'>) {
  const { id } = await params
  const { pages, lostItems } = getMessages(await getLocale())
  const item = await getLostItem(Number(id))

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
