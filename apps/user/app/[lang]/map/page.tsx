import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'

/** 지도 탭 */
export default async function MapPage() {
  const { pages } = getMessages(await getLocale())
  return <h1>{pages.map}</h1>
}
