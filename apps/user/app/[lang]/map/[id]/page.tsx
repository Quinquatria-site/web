import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { getPlaces } from '@/features/map/get-places'
import { placeHours, toPlaceId } from '@/features/map/map-place'
import { MapView } from '@/features/map/MapView'
import { DuskBackground } from '@/shared/background/DuskBackground'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'
import { PageTitle } from '@/shared/page-title/PageTitle'
import { localePath } from '@/shared/i18n/paths'
import { oneLine, shareMetadata, taggedTitle } from '@/shared/metadata/share-metadata'
import { assetUrl } from '@/shared/photo/asset-url'
import { formatSeoulDay } from '@/shared/time/format-seoul-time'

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

/** 공유 카드에 `[종류] 이름`, 운영 날짜·시간·단과대·설명, 첫 사진을 싣는다 */
export async function generateMetadata(
  { params }: PageProps<'/[lang]/map/[id]'>,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params
  const { place } = await findPlace(id)
  if (!place) return {}
  const locale = await getLocale()
  const { map, meta, pages } = getMessages(locale)
  const category = map.places[place.code]
  // 이름이 빈 서버 장소도 주소만 덩그러니 뜨지 않게 지도 페이지 이름으로 채운다
  const name = place.name || meta.pageTitle.replace('{page}', pages.map)
  // 이름이 이미 종류를 담으면(의무실·입장 팔찌 수령처) 머리말이 같은 말을 되풀이한다
  const title = name.includes(category) ? name : taggedTitle(locale, category, name)
  const hours = placeHours(place)
  const when = place.start_hour && `${formatSeoulDay(place.start_hour, locale)} ${hours}`
  const description =
    oneLine([when, place.host_college, place.description].filter(Boolean).join(' · ')) ||
    meta.placeFallback
  const image = place.place_image_uri?.[0]
  return shareMetadata(parent, {
    title,
    description,
    path: localePath(locale, `/map/${place.id}`),
    ...(image && { image: { url: assetUrl(image), alt: name } }),
  })
}

/** 장소 하나를 고른 채로 여는 지도. 홍보 링크로 들어오면 그 장소로 확대하고 시트를 연다 */
export default async function MapPlacePage({ params }: PageProps<'/[lang]/map/[id]'>) {
  const found = await findPlace((await params).id)
  if (!found?.place) notFound()
  const { pages } = getMessages(await getLocale())

  return (
    <>
      <DuskBackground />
      <PageTitle title={pages.map} />
      <MapView places={found.places} initialPlaceId={found.place.id} />
    </>
  )
}
