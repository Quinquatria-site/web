import type { ResolvingMetadata } from 'next'
import { getPlaces } from '@/features/map/get-places'
import { MapView } from '@/features/map/MapView'
import { DuskBackground } from '@/shared/background/DuskBackground'
import { PageHeader } from '@/shared/header/PageHeader'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'
import { listShareMetadata } from '@/shared/metadata/share-metadata'

/** 공유 카드에 페이지 이름과 소개 문구를 싣는다 */
export async function generateMetadata(_: PageProps<'/[lang]/map'>, parent: ResolvingMetadata) {
  return listShareMetadata(parent, await getLocale(), 'map', '/map')
}

/** 지도 탭 */
export default async function MapPage() {
  const { pages } = getMessages(await getLocale())
  const places = await getPlaces()
  return (
    <>
      <DuskBackground />
      <PageHeader title={pages.map} />
      <MapView places={places} />
    </>
  )
}
