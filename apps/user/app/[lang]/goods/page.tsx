import { GOODS } from '@/features/goods/goods'
import { GoodsCarousel } from '@/features/goods/GoodsCarousel'
import { GoodsImagePreload } from '@/features/goods/GoodsImagePreload'
import { GoodsIntro } from '@/features/goods/GoodsIntro'
import { GoodsSheet } from '@/features/goods/GoodsSheet'
import { PageHeader } from '@/shared/header/PageHeader'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'
import { localePath } from '@/shared/i18n/paths'

/** 굿즈 탭. 소개 카드 아래 굿즈를 한 장씩 넘겨 보고, 전체 목록은 시트로 연다 */
export default async function GoodsPage() {
  const locale = await getLocale()
  const { pages, goods } = getMessages(locale)

  return (
    <>
      <GoodsImagePreload goods={GOODS} />
      <PageHeader title={pages.goods} />
      <div className="flex flex-col gap-[22px] px-[11px] pt-2.5">
        <GoodsIntro
          title={goods.introTitle}
          subtitle={goods.introSubtitle}
          salesLabel={goods.salesLocation}
          salesHref={localePath(locale, '/map')}
        />
        <div className="flex flex-col items-center gap-[18px] px-[7px]">
          <GoodsCarousel goods={GOODS} />
          <GoodsSheet goods={GOODS} />
        </div>
      </div>
    </>
  )
}
