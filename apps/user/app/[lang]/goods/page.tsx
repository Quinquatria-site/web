import type { ResolvingMetadata } from 'next'
import { GOODS } from '@/features/goods/goods'
import { GoodsCarousel } from '@/features/goods/GoodsCarousel'
import { GoodsImagePreload } from '@/features/goods/GoodsImagePreload'
import { GoodsIntro } from '@/features/goods/GoodsIntro'
import { GoodsSheet } from '@/features/goods/GoodsSheet'
import { DuskBackground } from '@/shared/background/DuskBackground'
import { PageHeader } from '@/shared/header/PageHeader'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'
import { listShareMetadata } from '@/shared/metadata/share-metadata'
import { localePath } from '@/shared/i18n/paths'

/** 공유 카드에 페이지 이름과 소개 문구를 싣는다 */
export async function generateMetadata(_: PageProps<'/[lang]/goods'>, parent: ResolvingMetadata) {
  return listShareMetadata(parent, await getLocale(), 'goods', '/goods')
}

/** 굿즈 탭. 소개 아래 굿즈를 한 장씩 넘겨 보고, 전체 목록은 시트로 연다 */
export default async function GoodsPage() {
  const locale = await getLocale()
  const { pages, goods } = getMessages(locale)

  return (
    <>
      <GoodsImagePreload goods={GOODS} />
      <DuskBackground />
      <PageHeader title={pages.goods} />
      <div className="flex flex-col items-center gap-7 px-[18px] pt-5">
        <GoodsIntro
          text={goods.intro}
          salesLabel={goods.salesLocation}
          salesHref={localePath(locale, '/map')}
        />
        <div className="flex w-full flex-col items-center gap-9">
          <GoodsCarousel goods={GOODS} />
          <GoodsSheet goods={GOODS} />
        </div>
      </div>
    </>
  )
}
