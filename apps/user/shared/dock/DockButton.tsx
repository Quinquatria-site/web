'use client'

import { AnimatePresence, motion } from 'motion/react'
import { usePathname, useRouter } from 'next/navigation'
import { backFallback, canGoBackInApp, scrollToTop } from './dock-actions'
import { ArrowLeftIcon, ArrowUpIcon } from './dock-icons'
import type { DockMode } from './dock-mode'
import { ARROW_IN, ARROW_OUT, DOCK_POP, DOCK_SPRING, TAB_COLLAPSE } from './dock-motion'

/** 원 모양일 때의 버튼. 숨김 상태에서도 위로 가기 모양으로 남아 다시 뜰 때 그대로 커진다 */
export function DockButton({ mode }: { mode: DockMode }) {
  const router = useRouter()
  const pathname = usePathname()
  const back = mode === 'back'

  function handleClick() {
    if (!back) return scrollToTop()
    if (canGoBackInApp()) router.back()
    else router.push(backFallback(pathname))
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      aria-label={back ? '뒤로 가기' : '맨 위로'}
      // 폭 0 에서 벌어져야 접히는 탭과 합쳐 도크 폭이 끊기지 않는다
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 'auto', opacity: 1 }}
      // 화살표가 벌어지는 탭에 깔려 찌그러지지 않게 폭보다 먼저 사라진다
      exit={{
        width: 0,
        opacity: 0,
        transition: { width: { duration: TAB_COLLAPSE }, opacity: { duration: ARROW_OUT } },
      }}
      // 접힐 때는 탭이 어느 정도 걷힌 뒤에 화살표를 띄운다
      transition={{ width: DOCK_SPRING, opacity: ARROW_IN }}
      className="flex shrink-0 items-center justify-center overflow-hidden"
    >
      <span className="flex size-[calc(var(--dock-size)-2*var(--dock-pad))] shrink-0 items-center justify-center">
        {/* mode="wait" 라 앞 아이콘이 사라진 뒤에 다음 아이콘이 나타난다 */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={back ? 'back' : 'top'}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={DOCK_POP}
          >
            {back ? <ArrowLeftIcon className="size-6" /> : <ArrowUpIcon className="size-6" />}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.button>
  )
}
