import { MapView } from '@/features/map/MapView'
import { PageHeader } from '@/shared/header/PageHeader'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'

/** 지도 탭 */
export default async function MapPage() {
  const { pages } = getMessages(await getLocale())
  return (
    <>
      <PageHeader title={pages.map} />
      <MapView />
    </>
  )
}
