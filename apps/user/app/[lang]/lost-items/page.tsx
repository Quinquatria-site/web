import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'

/** 분실물 탭 */
export default async function LostItemsPage() {
  const { pages } = getMessages(await getLocale())
  return <h1>{pages.lostItems}</h1>
}
