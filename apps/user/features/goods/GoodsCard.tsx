import { heirOfLight } from '@/shared/fonts/heir-of-light'
import { GoodsPhoto } from './GoodsPhoto'

/** 굿즈 카드의 테두리·그림자·바탕. 뒤에 겹친 빈 카드도 같은 모양을 쓴다 */
export const CARD_FRAME =
  'rounded-2xl border border-primary bg-bg bg-linear-to-b from-bg/20 to-primary/20 shadow-[0_2px_16px_rgb(249_163_66/0.4)]'

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
      {/* 이름 두 줄 자리를 늘 잡아 둬야 넘길 때 카드 높이와 아래 버튼이 튀지 않는다. 남는 줄은 가격 아래로 보내 사진 밑에 붙인다 */}
      <div className="flex min-h-[calc(2lh+var(--text-xl)*1.288)] flex-col items-center text-center font-heir text-2xl leading-[normal] font-bold">
        <h2 className="text-text">{name}</h2>
        <p className="text-xl leading-[1.288] text-accent">{price}</p>
      </div>
    </article>
  )
}
