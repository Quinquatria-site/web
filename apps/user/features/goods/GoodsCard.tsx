import { heirOfLight } from '@/shared/fonts/heir-of-light'
import { GlowDot, GlowStar } from '@/shared/ornament/GlowSparkle'
import { GoodsPhoto } from './GoodsPhoto'

/** 굿즈 카드의 테두리·그림자·바탕. 뒤에 겹친 빈 카드도 같은 모양을 쓴다 */
export const CARD_FRAME =
  'rounded-2xl border border-primary bg-bg bg-linear-to-b from-bg/20 to-primary/20 shadow-[0_2px_16px_rgb(249_163_66/0.4)]'

// 피그마 카드(1241:85) 의 이름 양옆 꾸밈요소 자리. 좁은 폰에서 사진이 줄어도 이름 곁에 남게 아래를 기준으로 잰다
const DOTS = [
  { size: 'sm', className: 'bottom-[62px] left-11' },
  { size: 'md', className: 'bottom-14 left-[61px]' },
  { size: 'md', className: 'bottom-[34px] left-[38px]' },
  { size: 'md', className: 'bottom-[19px] right-[59px]' },
  { size: 'sm', className: 'bottom-[37px] right-[50px]' },
] as const

/** 카드 넘기기의 앞 카드 한 장. 위에 구름 바탕 사진, 아래에 이름·가격을 가운데 둔다 */
export function GoodsCard({
  image,
  name,
  price,
  order,
}: {
  image: string
  name: string
  price: string
  order: number
}) {
  return (
    <article
      className={`${CARD_FRAME} ${heirOfLight.variable} relative flex flex-col items-center gap-[18px] px-[18px] pt-[18px] pb-6`}
    >
      <div className="w-full">
        <GoodsPhoto src={image} name={name} order={order} variant="card" />
      </div>
      {/* 꾸밈 칸이 flex 항목이 되면 gap 이 한 번 더 붙어 사진과 이름이 벌어진다 */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <GlowStar kind="a" className="absolute bottom-[60px] left-[18px]" />
        <GlowStar kind="b" className="absolute right-[18px] bottom-[13px]" />
        {DOTS.map(({ size, className }, i) => (
          <GlowDot key={i} size={size} className={`absolute ${className}`} />
        ))}
      </div>
      {/* 이름 두 줄 자리를 늘 잡아 둬야 넘길 때 카드 높이와 아래 버튼이 튀지 않는다. 남는 줄은 가격 아래로 보내 사진 밑에 붙인다 */}
      <div className="flex min-h-[calc(2lh+var(--text-xl)*1.288)] flex-col items-center text-center font-heir text-2xl leading-[normal] font-bold">
        <h2 className="text-text">{name}</h2>
        <p className="text-xl leading-[1.288] text-accent">{price}</p>
      </div>
    </article>
  )
}
