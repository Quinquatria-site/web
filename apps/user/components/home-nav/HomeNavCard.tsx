'use client'

import { motion } from 'motion/react'
import Image, { type StaticImageData } from 'next/image'
import Link from 'next/link'
import { DOCK_PRESS, PRESS_SCALE } from '@/components/dock/dock-motion'

/** 홈 바로가기 카드 한 장에 필요한 값. imageBox 는 피그마의 그림 크기·자리 */
export type HomeNavItem = {
  href: string
  title: string
  description: string
  image: StaticImageData
  imageBox: string
}

/** 홈 바로가기 카드. 왼쪽에 제목·설명, 오른쪽에 그림을 두고 누르면 해당 탭으로 간다 */
export function HomeNavCard({ href, title, description, image, imageBox }: HomeNavItem) {
  return (
    // 누르는 동안 도크와 같은 스프링으로 살짝 줄어 손끝 반응을 준다
    <motion.div whileTap={{ scale: PRESS_SCALE }} transition={DOCK_PRESS}>
      <Link
        href={href}
        className="relative flex h-[76px] flex-col gap-1 overflow-hidden rounded-xl bg-[#f6ece6] pt-[17px] pl-[21px] text-secondary"
      >
        <span className="text-xl leading-[normal] font-bold">{title}</span>
        <span className="text-xs leading-[normal] font-medium">{description}</span>
        <span className={`absolute ${imageBox}`}>
          <Image src={image} alt="" fill sizes="92px" className="object-cover" />
        </span>
      </Link>
    </motion.div>
  )
}
