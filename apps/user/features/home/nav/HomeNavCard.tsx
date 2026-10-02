'use client'

import { motion } from 'motion/react'
import Image, { type StaticImageData } from 'next/image'
import Link from 'next/link'
import { DOCK_PRESS, PRESS_SCALE } from '@/shared/dock/dock-motion'
import { heirOfLight } from '@/shared/fonts/heir-of-light'

/** 홈 바로가기 카드 한 장에 필요한 값. imageBox 는 390 화면 피그마의 그림 폭·오른쪽 여백(px) */
export type HomeNavItem = {
  href: string
  title: string
  description: string
  image: StaticImageData
  imageBox: { right: number; width: number }
}

// 그림 앞에서 글자가 멈추는 간격(px)
const TEXT_GAP = 8
// 시안보다 그림을 줄여 좁은 폰·영어에서도 제목이 그림에 닿지 않게 한다. 가운데는 시안 자리에 둔다
const IMAGE_SCALE = 0.9

/** 홈 바로가기 카드. 왼쪽에 제목·설명, 오른쪽에 그림을 두고 누르면 해당 탭으로 간다 */
export function HomeNavCard({ href, title, description, image, imageBox }: HomeNavItem) {
  const imageWidth = imageBox.width * IMAGE_SCALE
  const imageRight = imageBox.right + (imageBox.width - imageWidth) / 2
  return (
    // 누르는 동안 도크와 같은 스프링으로 살짝 줄어 손끝 반응을 준다
    <motion.div whileTap={{ scale: PRESS_SCALE }} transition={DOCK_PRESS} className="@container">
      <Link
        href={href}
        // --u 는 피그마 1px 을 390 화면 카드 폭(346) 대비 비율로 옮긴 길이. 넓은 폰에서는 1px 에서 멈춰 시안보다 커지지 않는다
        // 피그마처럼 글 묶음을 세로 가운데에서 2.5px 위에 두려고 아래 여백만 5px 준다
        className={`${heirOfLight.variable} relative flex h-[76px] flex-col justify-center gap-0.5 overflow-hidden rounded-xl bg-[#f6ece6] bg-linear-to-r from-[#fbf4ed]/20 to-primary/20 pb-[5px] pl-[22px] text-secondary [--u:min(1px,100cqw/346)]`}
        style={{
          paddingRight: `calc(${imageWidth + imageRight} * var(--u) + ${TEXT_GAP}px)`,
        }}
      >
        <span className="font-heir text-[length:calc(20*var(--u))] leading-[normal] font-bold whitespace-nowrap">
          {title}
        </span>
        {/* 설명은 그림 앞에서 꺾여도 두 줄이 카드 높이 안에 든다 */}
        <span className="text-[length:calc(12*var(--u))] leading-[normal]">{description}</span>
        <span
          className="absolute top-1/2 -translate-y-1/2"
          style={{
            right: `calc(${imageRight} * var(--u))`,
            width: `calc(${imageWidth} * var(--u))`,
            height: `calc(${76 * IMAGE_SCALE} * var(--u))`,
          }}
        >
          <Image src={image} alt="" fill sizes="92px" className="object-cover" />
        </span>
      </Link>
    </motion.div>
  )
}
