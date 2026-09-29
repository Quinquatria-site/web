import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'

/** 굿즈 탭 */
export default async function GoodsPage() {
  const { pages } = getMessages(await getLocale())
  return <h1>{pages.goods}</h1>
}
