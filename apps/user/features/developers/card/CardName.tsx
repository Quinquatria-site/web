'use client'

import { motion } from 'motion/react'
import { pop } from './variants'

/** 카드의 영문 이름. 글자마다 따로 튀어 오르고 화면 읽기에는 이름 하나로 읽힌다 */
export function CardName({ name, reduce }: { name: string; reduce: boolean }) {
  return (
    <h2
      aria-label={name}
      className="mt-3.5 font-cinzel text-[23px] leading-[1.1] font-bold tracking-[0.02em]"
    >
      {[...name].map((char, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block whitespace-pre"
          variants={pop(reduce)}
        >
          {char}
        </motion.span>
      ))}
    </h2>
  )
}
