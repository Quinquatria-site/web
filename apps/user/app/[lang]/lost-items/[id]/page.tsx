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
  return items.map(({ id }) => ({ id: String(id) }))
}

/** 빌드 뒤에 올라온 분실물도 첫 요청 때 굽고 캐시한다. 재검증은 이미 있는 페이지만 다시 굽기 때문이다 */
export const dynamicParams = true

/** 사진이 있는 분실물만 OG 이미지를 그 사진으로 바꾼다. openGraph 는 통째로 덮이니 부모 값을 펼쳐 images 만 갈아 끼운다 */
export async function generateMetadata(
  { params }: PageProps<'/[lang]/lost-items/[id]'>,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params
  if (!/^\d+$/.test(id)) return {}
  const item = await getLostItem(Number(id))
  if (!item?.image_url) return {}
  const { openGraph } = await parent
  return {
    openGraph: { ...openGraph, images: [{ url: assetUrl(item.image_url), alt: item.title }] },
  }
}

/** 분실물 상세 */
export default async function LostItemDetailPage({ params }: PageProps<'/[lang]/lost-items/[id]'>) {
  const { id } = await params
  const { pages, lostItems } = getMessages(await getLocale())
  // 숫자가 아닌 주소는 API 가 422 로 답해 500 이 되므로 부르기 전에 걸러 낸다
  if (!/^\d+$/.test(id)) notFound()
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
