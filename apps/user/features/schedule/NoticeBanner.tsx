import { BannerSparkles } from './BannerSparkles'

/** 공연 중이 아닐 때의 알림 배너. 노을빛 카드 가운데에 한 줄 문구와, 있으면 작은 둘째 줄을 둔다 */
export function NoticeBanner({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <p className="relative flex h-[100px] flex-col items-center justify-center gap-0.5 overflow-clip px-3 text-center rounded-xl border border-primary bg-bg bg-linear-to-r from-bg/20 to-primary/20 text-text shadow-[0_2px_16px_rgb(249_163_66/0.4)]">
      <BannerSparkles />
      <span className="relative text-lg leading-[normal] font-semibold phone-md:text-[22px] phone-lg:text-2xl">
        {title}
      </span>
      {subtitle && (
        <span className="relative text-base leading-[normal] font-medium text-[#574a53] phone-md:text-lg phone-lg:text-xl">
          {subtitle}
        </span>
      )}
    </p>
  )
}
