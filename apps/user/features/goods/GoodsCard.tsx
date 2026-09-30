import { Photo } from '@/shared/photo/Photo'

/** 굿즈 카드의 테두리·그림자. 뒤에 겹친 빈 카드도 같은 모양을 쓴다 */
export const CARD_FRAME =
  'rounded-2xl border border-[#dbc4aa] bg-bg shadow-[0_2px_4px_rgb(0_0_0/0.5)]'

/** 굿즈 가격 글자색. 시안의 파란 가격 */
export const PRICE_TEXT = 'text-[#006bc1]'

/** 카드 넘기기의 앞 카드 한 장. 위에 사진, 아래에 이름·가격·설명을 가운데 둔다 */
export function GoodsCard({
  image,
  name,
  price,
  description,
}: {
  image: string
  name: string
  price: string
  description: string
}) {
  return (
    <article className={`${CARD_FRAME} flex flex-col items-center gap-2 px-[18px] pt-[18px] pb-6`}>
      <div className="aspect-square w-full overflow-hidden rounded-xl">
        <Photo src={image} alt={name} sizes="(max-width: 480px) 80vw, 300px" />
      </div>
      <div className="flex flex-col items-center gap-1 text-center text-text">
        <h2 className="text-[28px] leading-[normal] font-semibold">{name}</h2>
        <p className={`text-xl leading-[1.08] font-semibold ${PRICE_TEXT}`}>{price}</p>
        <p className="leading-[1.288] font-medium">{description}</p>
      </div>
    </article>
  )
}
