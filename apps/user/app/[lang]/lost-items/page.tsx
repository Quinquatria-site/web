import type { ResolvingMetadata } from 'next'
import { getLostItems } from '@/features/lost-items/get-lost-items'
import { LostItemGrid } from '@/features/lost-items/LostItemGrid'
import { LostItemsContact } from '@/features/lost-items/LostItemsContact'
import { LostItemsEmpty } from '@/features/lost-items/LostItemsEmpty'
import { DuskBackground } from '@/shared/background/DuskBackground'
import { LightBackground } from '@/shared/background/LightBackground'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'
import { listShareMetadata } from '@/shared/metadata/share-metadata'

/** 공유 카드에 페이지 이름과 소개 문구를 싣는다 */
export async function generateMetadata(
  _: PageProps<'/[lang]/lost-items'>,
  parent: ResolvingMetadata,
) {
  return listShareMetadata(parent, await getLocale(), 'lostItems', '/lost-items')
}

/** 분실물 탭. 문의 안내 아래 카드를 깔고, 올라온 분실물이 없으면 빈 화면을 보여 준다 */
export default async function LostItemsPage() {
  const { lostItems } = getMessages(await getLocale())
  // 분실물은 축제가 끝난 뒤 올라와서 그 전까지는 0건이라 빈 화면이 구워진다
  const items = await getLostItems()

  return (
    <>
      {/* 빈 화면은 밝은 바탕, 목록은 카드가 돋보이게 저녁 하늘을 깐다 */}
      {items.length === 0 ? <LightBackground glow /> : <DuskBackground />}
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
