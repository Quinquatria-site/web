'use client'

import { motion } from 'motion/react'
import { fadeOut, introTransition } from './timing'

/** 별자리 위 "Made by" 와 단체명. 글자가 흐림에서 또렷해지며 차례로 나타난다 */
export function ConstellationHeader({
  organization,
  entered,
  reduce,
}: {
  organization: string
  entered: boolean
  reduce: boolean
}) {
  return (
    <div
      className={`absolute inset-x-0 top-6 flex flex-col items-center gap-2 text-center text-base ${fadeOut(entered)}`}
    >
      <p className="font-cinzel tracking-[0.12em]">
        {[...'Made by'].map((char, i) => (
          <motion.span
            key={i}
            className="inline-block whitespace-pre"
            initial={{ opacity: 0, y: reduce ? 0 : 10, filter: reduce ? 'none' : 'blur(8px)' }}
            // 다 보인 뒤에도 blur(0px) 가 남으면 Safari 가 필터를 거쳐 다시 그려서 떼어 낸다
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
            transition={introTransition(reduce, 0.45 + i * 0.07)}
          >
            {char}
          </motion.span>
        ))}
      </p>
      <motion.p
        className="font-paperlogy font-light tracking-[0.04em]"
        initial={{ opacity: 0, y: reduce ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={introTransition(reduce, 1.1)}
      >
        {organization}
      </motion.p>
    </div>
  )
}
