import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { getPlaces } from '@/features/map/get-places'
import { placeHours, toPlaceId } from '@/features/map/map-place'
import { MapView } from '@/features/map/MapView'
import { DuskBackground } from '@/shared/background/DuskBackground'
import { PageHeader } from '@/shared/header/PageHeader'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'
import { assetUrl } from '@/shared/photo/asset-url'

/** 장소 id 로 정적 생성한다. 언어는 레이아웃이 곱한다 */
export async function generateStaticParams() {
  const places = await getPlaces()
  // 빈 배열이면 Next 가 다른 언어까지 미리 굽지 않아서, 없는 id 0 을 대신 준다. 0 은 목록에 없어 404 로 간다
  if (places.length === 0) return [{ id: '0' }]
  return places.map(({ id }) => ({ id: String(id) }))
}

/** 빌드 뒤에 올라온 장소도 첫 요청 때 굽고 캐시한다. 재검증은 이미 있는 페이지만 다시 굽기 때문이다 */
export const dynamicParams = true

// 목록에 없는 id 는 null. 목록은 지도와 같은 요청이라 캐시에서 나온다
async function findPlace(segment: string) {
  const id = toPlaceId(segment)
  const places = await getPlaces()
  return { places, place: places.find((place) => place.id === id) ?? null }
}

/** 공유 카드에 장소 이름·설명·첫 사진을 싣는다. openGraph 는 통째로 덮이니 부모 값을 펼친다 */
export async function generateMetadata(
  { params }: PageProps<'/[lang]/map/[id]'>,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { lang, id } = await params
  const { place } = await findPlace(id)
  if (!place) return {}
  // 설명이 없는 서버 장소는 시트 요약줄과 같은 운영 단과대·시간으로 채운다
  const description =
    place.description || [place.host_college, placeHours(place)].filter(Boolean).join(' · ')
  const image = place.place_image_uri?.[0]
  const { openGraph } = await parent
  return {
    title: place.name,
    description,
    openGraph: {
      ...openGraph,
      title: place.name,
      description,
      url: `/${lang}/map/${place.id}`,
      ...(image && { images: [{ url: assetUrl(image), alt: place.name }] }),
    },
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
