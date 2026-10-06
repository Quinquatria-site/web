'use client'

import { motion } from 'motion/react'
import Image, { type StaticImageData } from 'next/image'

/** 카드 위쪽 사진 칸. 사진이 없으면 사람 실루엣을 두고, 오른쪽 위에 순번을 적는다 */
export function CardPhoto({ photo, index }: { photo?: StaticImageData; index: number }) {
  return (
    <motion.div
      className="relative h-[252px] overflow-hidden rounded-[14px] bg-linear-to-b from-bg/55 to-bg/20"
      variants={{ hidden: { scale: 1.08 }, shown: { scale: 1 } }}
    >
      {photo ? (
        <Image src={photo} alt="" fill sizes="236px" className="object-contain object-bottom" />
      ) : (
        <svg
          aria-hidden
          viewBox="0 0 100 90"
          className="absolute bottom-0 left-1/2 w-[150px] -translate-x-1/2 fill-secondary opacity-50"
        >
          <circle cx="50" cy="30" r="18" />
          <path d="M14 90c0-22 16-36 36-36s36 14 36 36z" />
        </svg>
      )}
      <span
        aria-hidden
        className="absolute top-2.5 right-3 font-cinzel text-[34px] leading-none font-bold text-text-inverse/85"
      >
        {String(index + 1).padStart(2, '0')}
      </span>
    </motion.div>
  )
}
