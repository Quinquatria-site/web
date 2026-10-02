import { getPlaces } from '@/features/map/get-places'
import { MapView } from '@/features/map/MapView'
import { DuskBackground } from '@/shared/background/DuskBackground'
import { PageHeader } from '@/shared/header/PageHeader'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'

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
