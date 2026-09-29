import { LostItemsEmpty } from '@/features/lost-items/LostItemsEmpty'
import { PageHeader } from '@/shared/header/PageHeader'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'

/** 분실물 탭. 분실물은 축제가 끝난 뒤 올라와서 지금은 빈 화면만 보여 준다 */
export default async function LostItemsPage() {
  const { pages, lostItems } = getMessages(await getLocale())
  return (
    <>
      <PageHeader title={pages.lostItems} />
      <LostItemsEmpty title={lostItems.emptyTitle} hint={lostItems.emptyHint} />
    </>
  )
}
