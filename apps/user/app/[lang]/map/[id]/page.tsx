import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { getPlaces } from '@/features/map/get-places'
import { MapView } from '@/features/map/MapView'
import { DuskBackground } from '@/shared/background/DuskBackground'
import { PageHeader } from '@/shared/header/PageHeader'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'
import { assetUrl } from '@/shared/photo/asset-url'

/** 장소 id 로 정적 생성한다. 언어는 레이아웃이 곱한다 */
export async function generateStaticParams() {
  const places = await getPlaces()
  return places.map(({ id }) => ({ id: String(id) }))
}

/** 빌드 뒤에 올라온 장소도 첫 요청 때 굽고 캐시한다. 재검증은 이미 있는 페이지만 다시 굽기 때문이다 */
export const dynamicParams = true

// 숫자가 아니거나 목록에 없는 id 는 null. 목록은 지도와 같은 요청이라 캐시에서 나온다
async function findPlace(id: string) {
  if (!/^\d+$/.test(id)) return null
  const places = await getPlaces()
  return { places, place: places.find((place) => place.id === Number(id)) ?? null }
}

/** 사진이 있는 장소만 OG 이미지를 첫 사진으로 바꾼다. openGraph 는 통째로 덮이니 부모 값을 펼쳐 images 만 갈아 끼운다 */
export async function generateMetadata(
  { params }: PageProps<'/[lang]/map/[id]'>,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const found = await findPlace((await params).id)
  const image = found?.place?.place_image_uri?.[0]
  if (!found?.place || !image) return {}
  const { openGraph } = await parent
  return {
    openGraph: { ...openGraph, images: [{ url: assetUrl(image), alt: found.place.name }] },
  }
}

/** 장소 하나를 고른 채로 여는 지도. 홍보 링크로 들어오면 그 장소로 확대하고 시트를 연다 */
export default async function MapPlacePage({ params }: PageProps<'/[lang]/map/[id]'>) {
  const found = await findPlace((await params).id)
  if (!found?.place) notFound()
  const { pages } = getMessages(await getLocale())

  return (
    <>
      <DuskBackground />
      <PageHeader title={pages.map} />
      <MapView places={found.places} initialPlaceId={found.place.id} />
    </>
  )
}
