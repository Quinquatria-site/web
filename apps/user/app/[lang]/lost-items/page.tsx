import { DUMMY_LOST_ITEMS } from '@/features/lost-items/dummy-lost-items'
import { LostItemGrid } from '@/features/lost-items/LostItemGrid'
import { LostItemsContact } from '@/features/lost-items/LostItemsContact'
import { LostItemsEmpty } from '@/features/lost-items/LostItemsEmpty'
import { PageHeader } from '@/shared/header/PageHeader'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'

/** 분실물 탭. 문의 안내 아래 카드를 깔고, 올라온 분실물이 없으면 빈 화면을 보여 준다 */
export default async function LostItemsPage() {
  const { pages, lostItems } = getMessages(await getLocale())
  // 분실물은 축제가 끝난 뒤 올라와서, 그 전까지 더미로 그린다. 올라오면 getLostItems() 로 바꾼다
  const items = DUMMY_LOST_ITEMS

  return (
    <>
      <PageHeader title={pages.lostItems} />
      {items.length === 0 ? (
        <LostItemsEmpty title={lostItems.emptyTitle} hint={lostItems.emptyHint} />
      ) : (
        <div className="flex flex-col gap-3 px-5 pt-4">
          <LostItemsContact
            notice={lostItems.contactNotice}
            instagramLabel={lostItems.councilInstagram}
            callLabel={lostItems.councilCall}
          />
          <LostItemGrid items={items} />
        </div>
      )}
    </>
  )
}
