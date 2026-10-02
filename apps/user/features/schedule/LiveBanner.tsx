import Image from 'next/image'
import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'
import bannerAthena from './images/banner-athena.png'
import type { Performance } from './performance'
import { performanceAnchorId } from './Timeline'

/** 공연 중 배너. 그 공연을 띄우고 누르면 타임라인의 그 카드로 옮겨 간다 */
export async function LiveBanner({ performance }: { performance: Performance }) {
  const { schedule } = getMessages(await getLocale())
  return (
    <a
      href={`#${performanceAnchorId(performance.id)}`}
      className="relative flex h-[100px] flex-col justify-between overflow-clip rounded-xl border border-primary bg-bg bg-linear-to-r from-bg/20 to-primary/20 px-3.5 pt-[11px] pb-3 text-text shadow-[0_2px_16px_rgb(249_163_66/0.4)]"
    >
      {/* 시안처럼 가운데보다 5px 내려 두고, 오른쪽으로 치우쳐 잘라 창끝까지 보인다 */}
      <Image
        src={bannerAthena}
        alt=""
        sizes="180px"
        className="absolute top-[calc(50%+5px)] left-1/2 h-[118px] w-[140px] -translate-1/2 object-cover object-[65%_50%] opacity-30"
      />
      <span className="relative flex items-center gap-3 text-base leading-[normal] font-semibold">
        <span
          aria-hidden
          className="size-2.5 rounded-full bg-primary shadow-[0_0_4px_3px_rgb(249_163_66/0.25)]"
        />
        {schedule.liveNow}
      </span>
      <span className="relative max-w-full self-end truncate text-lg leading-[normal] font-semibold phone-md:text-[22px] phone-lg:text-2xl">
        {performance.title}
      </span>
    </a>
  )
}
