import { heirOfLight } from '@/shared/fonts/heir-of-light'
import { LinkBadge } from '@/shared/link-badge/LinkBadge'
import { GlowDot, GlowStar } from '@/shared/ornament/GlowSparkle'

// 피그마 꾸밈요소(1214:70) 의 점 자리. 점 SVG 는 번짐 칸이라 점보다 4px 바깥에 둔다
const DOTS = [
  { size: 'sm', className: 'top-[26px] left-[26px]' },
  { size: 'md', className: 'top-[31px] left-[43px]' },
  { size: 'md', className: 'top-[53px] left-5' },
  { size: 'md', className: 'top-14 right-[41px]' },
  { size: 'sm', className: 'top-[39px] right-[32px]' },
] as const

/** 굿즈 탭 맨 위 소개. 반짝이 별 사이 두 줄 인사와 판매 장소로 가는 배지를 가운데 둔다 */
export function GoodsIntro({
  text,
  salesLabel,
  salesHref,
}: {
  /** 줄바꿈(\n)으로 나눈 두 줄 */
  text: string
  salesLabel: string
  salesHref: string
}) {
  return (
    <section className="flex flex-col items-center gap-2">
      <div className="relative flex h-[72px] w-[307px] justify-center pt-[11px]">
        <div aria-hidden className="pointer-events-none">
          <GlowStar kind="a" className="absolute top-0 left-0" />
          <GlowStar kind="b" className="absolute top-[35px] right-0" />
          {DOTS.map(({ size, className }, i) => (
            <GlowDot key={i} size={size} className={`absolute ${className}`} />
          ))}
        </div>
        <div
          className={`${heirOfLight.variable} flex flex-col gap-2 text-center font-heir leading-[1.288] text-text-inverse`}
        >
          {text.split('\n').map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
      <LinkBadge href={salesHref} tone="glow">
        {salesLabel}
      </LinkBadge>
    </section>
  )
}
