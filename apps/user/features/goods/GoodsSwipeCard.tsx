'use client'

import { motion, useIsPresent, usePresenceData, type PanInfo } from 'motion/react'
import type { ReactNode, Ref } from 'react'
import {
  BURN_START,
  exitTarget,
  TEAR_LEFT,
  TEAR_RIGHT,
  tearPiece,
  type ExitPlan,
} from './exit-effects'

const SLIDE = { type: 'spring', bounce: 0, duration: 0.35 } as const

// 타는 선 아래는 지우고, 선 바로 위 좁은 띠만 반쯤 비쳐 그을린 가장자리를 만든다
const BURN_MASK =
  'linear-gradient(to top, transparent var(--burn), rgb(0 0 0 / 0.5) calc(var(--burn) + 3%), black calc(var(--burn) + 8%))'
// 타는 선을 따라 주황 불씨와 검붉은 그을음 띠를 겹쳐 그린다
const BURN_GLOW =
  'linear-gradient(to top, transparent var(--burn), rgb(255 138 0) calc(var(--burn) + 1%), rgb(120 45 20 / 0.85) calc(var(--burn) + 4%), transparent calc(var(--burn) + 12%))'

/** 앞에 보이는 굿즈 카드 한 장. 좌우로 밀 수 있고, 떠날 때는 넘길 때 고른 효과로 사라진다 */
export function GoodsSwipeCard({
  ref,
  enterFrom,
  onDragEnd,
  children,
}: {
  /** 들어오는 쪽 거리(px). 다음이면 오른쪽(+), 이전이면 왼쪽(-) */
  enterFrom: number
  onDragEnd: (event: unknown, info: PanInfo) => void
  children: ReactNode
  /** AnimatePresence popLayout 이 떠나는 카드를 레이아웃에서 빼려면 바깥 요소를 잡아야 한다 */
  ref?: Ref<HTMLDivElement>
}) {
  const isPresent = useIsPresent()
  // 떠나는 동안에만 AnimatePresence 가 넘긴 순간의 효과를 알려 준다
  const plan = usePresenceData() as ExitPlan | undefined
  const leaving = !isPresent && plan && !plan.reduced ? plan : null
  const side = leaving ? -leaving.direction : 0

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: enterFrom }}
      animate={{ opacity: 1, x: 0 }}
      variants={{ exit: (p: ExitPlan) => exitTarget(p) }}
      exit="exit"
      transition={SLIDE}
      drag={isPresent ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragEnd={onDragEnd}
      style={
        leaving?.effect === 'burn'
          ? { ['--burn' as string]: BURN_START, maskImage: BURN_MASK }
          : undefined
      }
      // 사진의 그림 끌기가 밀기를 가로채지 않게 막고, 떠나는 카드는 새 카드 위로 올려 효과가 가리지 않게 한다
      className={`relative rotate-1 touch-pan-y [&_img]:pointer-events-none ${isPresent ? '' : 'z-10'}`}
    >
      {leaving?.effect === 'tear' ? (
        <>
          <motion.div style={{ clipPath: TEAR_LEFT }} animate={tearPiece('left', side)}>
            {children}
          </motion.div>
          <motion.div
            aria-hidden
            style={{ clipPath: TEAR_RIGHT }}
            animate={tearPiece('right', side)}
            className="absolute inset-0"
          >
            {children}
          </motion.div>
        </>
      ) : (
        children
      )}
      {leaving?.effect === 'burn' && (
        <div
          aria-hidden
          style={{ backgroundImage: BURN_GLOW }}
          className="pointer-events-none absolute inset-0 rounded-2xl"
        />
      )}
    </motion.div>
  )
}
