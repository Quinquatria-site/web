import { GlowDot, GlowStar } from '@/shared/ornament/GlowSparkle'

// 피그마 꾸밈요소(856:3697)의 점 자리
const DOTS = [
  { size: 'sm', className: 'top-10 left-10' },
  { size: 'md', className: 'top-[45px] left-[57px]' },
  { size: 'md', className: 'top-[67px] left-[34px]' },
  { size: 'md', className: 'top-[70px] right-[58px]' },
  { size: 'sm', className: 'top-[53px] right-[49px]' },
] as const

/** 알림 배너 양 끝의 반짝이 별과 빛 점 */
export function BannerSparkles() {
  return (
    <span aria-hidden>
      <GlowStar kind="a" className="absolute top-3.5 left-3.5" />
      <GlowStar kind="b" className="absolute right-[17px] bottom-3.5" />
      {DOTS.map(({ size, className }, i) => (
        <GlowDot key={i} size={size} className={`absolute ${className}`} />
      ))}
    </span>
  )
}
