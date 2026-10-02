import { MapView } from '@/features/map/MapView'
import { MOCK_PLACES } from '@/features/map/mock-places'
import { DuskBackground } from '@/shared/background/DuskBackground'
import { PageHeader } from '@/shared/header/PageHeader'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'

/** 지도 탭 */
export default async function MapPage() {
  const { pages } = getMessages(await getLocale())
  return (
    <>
      <DuskBackground />
      <PageHeader title={pages.map} />
      {/* 장소 API 를 잇기 전이라 비워 둔다 */}
      <MapView places={MOCK_PLACES} />
    </>
  )
}
