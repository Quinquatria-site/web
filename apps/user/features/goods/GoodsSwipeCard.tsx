'use client'

import { motion, useIsPresent, useMotionValue, type PanInfo, type Variants } from 'motion/react'
import type { ReactNode, Ref } from 'react'

const SLIDE = { type: 'spring', bounce: 0, duration: 0.35 } as const

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
  const x = useMotionValue(0)

  // custom 은 넘긴 쪽 거리(px). 새 카드는 그쪽에서 들어오고 옛 카드는 반대쪽으로 빠진다
  const variants: Variants = {
    enter: (shift: number) => ({ opacity: 0, x: shift }),
    center: { opacity: 1, x: 0 },
    // 밀다 놓은 자리에서 이어서 빠져야 -40 보다 멀리 끈 카드가 되돌아오지 않는다
    exit: (shift: number) => ({ opacity: 0, x: x.get() - shift }),
  }

  return (
    <motion.div
      ref={ref}
      style={{ x }}
      custom={shift}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={SLIDE}
      drag={isPresent ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragEnd={onDragEnd}
      // 사진의 그림 끌기가 밀기를 가로채지 않게 막는다
      // 미끄러지고 끌리는 동안 Safari 가 카드를 매 프레임 다시 그리지 않게 레이어로 미리 올린다
      className="relative rotate-1 touch-pan-y will-change-transform [&_img]:pointer-events-none"
    >
      {children}
    </motion.div>
  )
}
