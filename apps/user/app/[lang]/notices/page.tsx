import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'

/** 공지 탭 */
export default async function NoticesPage() {
  const { pages } = getMessages(await getLocale())
  return <h1>{pages.notices}</h1>
}
