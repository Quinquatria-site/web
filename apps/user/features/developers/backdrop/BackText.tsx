'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'

const TEXT = 'DEVELOPERS ✦ DEVELOPERS ✦ DEVELOPERS ✦ '
// 외곽선 글자는 다시 그리기 비싸 레이어로 올린 채 옮긴다
const LINE =
  'absolute left-0 font-cinzel text-[130px] leading-none font-bold whitespace-nowrap text-transparent will-change-transform'

/** 카드 뒤에 깔리는 큰 외곽선 글자 두 줄. 카드를 넘기면 서로 반대로 다른 속도로 흐른다 */
export function BackText({
  cards,
  opacity,
}: {
  cards: MotionValue<number>
  opacity: MotionValue<number>
}) {
  const upperX = useTransform(cards, (c) => -200 + c * 300)
  const lowerX = useTransform(cards, (c) => -c * 400)

  return (
    <motion.div aria-hidden className="pointer-events-none" style={{ opacity }}>
      <motion.p
        className={`${LINE} [-webkit-text-stroke:1px_rgb(253_235_184/0.22)]`}
        style={{ top: '6%', x: upperX }}
      >
        {TEXT}
      </motion.p>
      <motion.p
        className={`${LINE} [-webkit-text-stroke:1px_rgb(249_163_66/0.25)]`}
        style={{ top: '78%', x: lowerX }}
      >
        {TEXT}
      </motion.p>
    </motion.div>
  )
}
