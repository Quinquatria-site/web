import Image from 'next/image'
import { heirOfLight } from '@/shared/fonts/heir-of-light'
import headerNight from './images/header-night.jpg'

/** 탭 페이지 맨 위 머리. 별자리 선이 걸린 밤하늘 위에 페이지 제목을 가운데 둔다 */
export function PageHeader({ title }: { title: string }) {
  return (
    <header
      className={`${heirOfLight.variable} relative z-10 flex h-19 items-center justify-center drop-shadow-[0_4px_2px_rgb(0_0_0/0.25)]`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={headerNight}
          alt=""
          fill
          priority
          sizes="(max-width: 480px) 100vw, 480px"
          // 별자리 선이 이미지 위쪽에 몰려 있어 위를 기준으로 자른다
          className="object-cover object-top"
        />
      </div>
      <h1 className="relative font-heir text-[22px] leading-[normal] tracking-[0.02em] text-text-inverse">
        {title}
      </h1>
    </header>
  )
}
