'use client'

import { motion, useIsPresent, type PanInfo, type Variants } from 'motion/react'
import type { ReactNode, Ref } from 'react'

const SLIDE = { type: 'spring', bounce: 0, duration: 0.35 } as const

// custom 은 넘긴 쪽 거리(px). 새 카드는 그쪽에서 들어오고 옛 카드는 반대쪽으로 빠진다
const VARIANTS: Variants = {
  enter: (shift: number) => ({ opacity: 0, x: shift }),
  center: { opacity: 1, x: 0 },
  exit: (shift: number) => ({ opacity: 0, x: -shift }),
}

/** 앞에 보이는 굿즈 카드 한 장. 좌우로 밀 수 있고, 넘기면 옆으로 미끄러지며 바뀐다 */
export function GoodsSwipeCard({
  ref,
  shift,
  onDragEnd,
  children,
}: {
  /** 넘긴 쪽 거리(px). 다음이면 오른쪽(+), 이전이면 왼쪽(-) */
  shift: number
  onDragEnd: (event: unknown, info: PanInfo) => void
  children: ReactNode
  /** AnimatePresence popLayout 이 떠나는 카드를 레이아웃에서 빼려면 바깥 요소를 잡아야 한다 */
  ref?: Ref<HTMLDivElement>
}) {
  const isPresent = useIsPresent()

  return (
    <motion.div
      ref={ref}
      custom={shift}
      variants={VARIANTS}
      initial="enter"
      animate="center"
      exit="exit"
      transition={SLIDE}
      drag={isPresent ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragEnd={onDragEnd}
      // 사진의 그림 끌기가 밀기를 가로채지 않게 막는다
      className="relative rotate-1 touch-pan-y [&_img]:pointer-events-none"
    >
      {children}
    </motion.div>
  )
}
