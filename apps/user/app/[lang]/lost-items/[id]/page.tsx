import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { getLostItem, getLostItems } from '@/features/lost-items/get-lost-items'
import { LostItemDetail } from '@/features/lost-items/LostItemDetail'
import { LightBackground } from '@/shared/background/LightBackground'
import { PageHeader } from '@/shared/header/PageHeader'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'
import { assetUrl } from '@/shared/photo/asset-url'

/** 목록에 있는 분실물 id 로 정적 생성한다. 언어는 레이아웃이 곱한다 */
export async function generateStaticParams() {
  const items = await getLostItems()
  // 빈 배열이면 Next 가 다른 언어까지 미리 굽지 않아서, 없는 id 0 을 대신 준다. 0 은 페이지가 API 를 부르기 전에 404 로 보낸다
  if (items.length === 0) return [{ id: '0' }]
  return items.map(({ id }) => ({ id: String(id) }))
}

/** 빌드 뒤에 올라온 분실물도 첫 요청 때 굽고 캐시한다. 재검증은 이미 있는 페이지만 다시 굽기 때문이다 */
export const dynamicParams = true

/** 공유 카드에 분실물 제목·습득 장소·사진을 싣는다. openGraph 는 통째로 덮이니 부모 값을 펼친다 */
export async function generateMetadata(
  { params }: PageProps<'/[lang]/lost-items/[id]'>,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { lang, id } = await params
  if (!/^[1-9]\d*$/.test(id)) return {}
  const item = await getLostItem(Number(id))
  if (!item) return {}
  const { lostItems } = getMessages(await getLocale())
  const description = [
    `${lostItems.foundLocation}: ${item.found_location}`,
    item.is_returned && lostItems.returned,
  ]
    .filter(Boolean)
    .join(' · ')
  const { openGraph } = await parent
  return {
    title: item.title,
    description,
    openGraph: {
      ...openGraph,
      title: item.title,
      description,
      url: `/${lang}/lost-items/${item.id}`,
      ...(item.image_url && { images: [{ url: assetUrl(item.image_url), alt: item.title }] }),
    },
  }
}

/** 분실물 상세 */
export default async function LostItemDetailPage({ params }: PageProps<'/[lang]/lost-items/[id]'>) {
  const { id } = await params
  const { pages, lostItems } = getMessages(await getLocale())
  // 1 이상 정수가 아닌 주소는 API 가 422 로 답해 500 이 되므로 부르기 전에 걸러 낸다
  if (!/^[1-9]\d*$/.test(id)) notFound()
  const item = await getLostItem(Number(id))
  if (!item) notFound()

  return (
    <>
      <LightBackground />
      <PageHeader title={pages.lostItems} />
      <LostItemDetail
        item={item}
        foundLocationLabel={lostItems.foundLocation}
        returnedLabel={lostItems.returned}
      />
    </>
  )
}
