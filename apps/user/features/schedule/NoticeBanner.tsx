import { heirOfLight } from '@/shared/fonts/heir-of-light'
import { BannerSparkles } from './BannerSparkles'

/** 공연 중이 아닐 때의 알림 배너. 노을빛 카드 가운데에 문구와, 있으면 작은 둘째 줄을 둔다. 문구 속 \n 은 줄바꿈이다 */
export function NoticeBanner({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <p
      className={`${heirOfLight.variable} relative flex h-[100px] flex-col items-center justify-center overflow-clip rounded-xl border border-primary bg-bg bg-linear-to-r from-bg/20 to-primary/20 px-3 text-center font-heir shadow-[0_2px_16px_rgb(249_163_66/0.4)]`}
    >
      <BannerSparkles />
      <span className="relative text-lg leading-[normal] font-bold whitespace-pre-line text-(--brown) phone-md:text-[22px] phone-lg:text-2xl">
        {title}
      </span>
      {subtitle && (
        <span className="relative text-base leading-[normal] text-(--brick) phone-md:text-lg phone-lg:text-xl">
          {subtitle}
        </span>
      )}
    </p>
  )
}
