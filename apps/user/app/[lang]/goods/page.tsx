import type { ResolvingMetadata } from 'next'
import { GOODS } from '@/features/goods/goods'
import { GoodsCarousel } from '@/features/goods/GoodsCarousel'
import { GoodsImagePreload } from '@/features/goods/GoodsImagePreload'
import { GoodsIntro } from '@/features/goods/GoodsIntro'
import { GoodsSheet } from '@/features/goods/GoodsSheet'
import { getPlaces } from '@/features/map/get-places'
import { placeLabel } from '@/features/map/map-place'
import { DuskBackground } from '@/shared/background/DuskBackground'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'
import { PageTitle } from '@/shared/page-title/PageTitle'
import { localePath } from '@/shared/i18n/paths'
import { listShareMetadata } from '@/shared/metadata/share-metadata'

// 굿즈를 파는 부스. id 는 DB 마다 달라 지도 마커 글자로 찾는다
const SALES_BOOTH_LABEL = 'C3'

/** 공유 카드에 페이지 이름과 소개 문구를 싣는다 */
export async function generateMetadata(_: PageProps<'/[lang]/goods'>, parent: ResolvingMetadata) {
  return listShareMetadata(parent, await getLocale(), 'goods', '/goods')
}

/** 굿즈 탭. 소개 아래 굿즈를 한 장씩 넘겨 보고, 전체 목록은 시트로 연다 */
export default async function GoodsPage() {
  const locale = await getLocale()
  const { pages, goods } = getMessages(locale)
  // 장소를 못 받아도 굿즈 페이지는 API 없이 그릴 수 있으니, 빌드를 멈추지 않고 지도 전체로 보낸다
  const places = await getPlaces().catch(() => [])
  const booth = places.find((place) => placeLabel(place) === SALES_BOOTH_LABEL)

  return (
    <>
      <GoodsImagePreload goods={GOODS} />
      <DuskBackground />
      <PageTitle title={pages.goods} />
      <div className="flex flex-col items-center gap-7 px-[18px] pt-5">
        <GoodsIntro
          text={goods.intro}
          salesLabel={goods.salesLocation}
          salesHref={localePath(locale, booth ? `/map/${booth.id}` : '/map')}
        />
        <div className="flex w-full flex-col items-center gap-9">
          <GoodsCarousel goods={GOODS} />
          <GoodsSheet goods={GOODS} />
        </div>
      </div>
    </>
  )
}
