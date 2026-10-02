import Image from 'next/image'
import { heirOfLight } from '@/shared/fonts/heir-of-light'
import { ZoomablePhoto } from '@/shared/photo/ZoomablePhoto'
import cloudSky from './images/cloud-sky.jpg'

/** 굿즈 사진 sizes. 카드·시트·미리 받기가 같은 값이어야 같은 최적화 주소를 받아 캐시를 함께 쓴다 */
export const PHOTO_SIZES = '(max-width: 480px) 80vw, 300px'

// card 는 넘기기 카드의 큰 사진, tile 은 전체 보기 시트의 격자 칸
const VARIANT = {
  card: {
    box: 'rounded-xl bg-[#e6d9cc]',
    number: 'top-1.5 left-3 text-base',
    // 피그마처럼 옷을 살짝 기울여 손으로 꽂은 사진처럼 보이게 한다
    photo: 'inset-[7.4%_8.5%_8.5%_7.4%] rotate-3',
  },
  tile: {
    box: 'rounded-lg bg-placeholder',
    number: 'top-1 left-1.5 text-xs',
    photo: 'inset-[7%]',
  },
}

/** 노을 구름 위에 배경 없는 굿즈 사진과 순번을 얹은 정사각 칸. 누르면 사진을 크게 본다 */
export function GoodsPhoto({
  src,
  name,
  order,
  variant,
}: {
  src: string
  name: string
  /** 1부터 세는 순번. 01. 처럼 두 자리로 적는다 */
  order: number
  variant: keyof typeof VARIANT
}) {
  const { box, number, photo } = VARIANT[variant]
  return (
    <div className={`${heirOfLight.variable} relative aspect-square overflow-hidden ${box}`}>
      <Image
        src={cloudSky}
        alt=""
        fill
        sizes={PHOTO_SIZES}
        className="pointer-events-none object-cover opacity-72"
      />
      <div className={`absolute ${photo}`}>
        <ZoomablePhoto src={src} alt={name} sizes={PHOTO_SIZES} bare />
      </div>
      <span
        aria-hidden
        className={`pointer-events-none absolute font-heir leading-[normal] font-bold text-(--brown) ${number}`}
      >
        {String(order).padStart(2, '0')}.
      </span>
    </div>
  )
}
