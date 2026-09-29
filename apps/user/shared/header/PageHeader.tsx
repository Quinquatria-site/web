import Image from 'next/image'
import { SparkleOrnament } from '@/shared/ornament/SparkleOrnament'
import { kimjungchulMyungjo } from './fonts'
import headerSky from './images/header-sky.jpg'

/** 탭 페이지 맨 위 머리. 노을 하늘 위에 별 장식과 페이지 제목을 가운데 둔다 */
export function PageHeader({ title }: { title: string }) {
  return (
    <header
      className={`${kimjungchulMyungjo.variable} relative flex h-19 items-center justify-center overflow-hidden`}
    >
      <Image
        src={headerSky}
        alt=""
        fill
        priority
        sizes="(max-width: 480px) 100vw, 480px"
        className="object-cover"
      />
      <div className="relative flex flex-col items-center drop-shadow-[0_2px_2px_rgb(0_0_0/0.25)]">
        <div className="-mb-[3px]">
          <SparkleOrnament axis="horizontal" size="sm" />
        </div>
        <h1 className="font-myungjo text-[22px] leading-[normal] tracking-[0.02em] text-text-inverse">
          {title}
        </h1>
      </div>
    </header>
  )
}
