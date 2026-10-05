'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { DOCK_PRESS, PRESS_SCALE } from '@/shared/dock/dock-motion'
import { ExternalIcon } from './ExternalIcon'

/** 카드 맨 아래 바깥 링크 버튼. 크레딧 링크 배지와 같은 그라데이션을 쓰고 새 탭으로 연다 */
export function OnlineCardCta({ href, children }: { href: string; children: ReactNode }) {
  return (
    // 누르는 동안 도크와 같은 스프링으로 살짝 줄어 손끝 반응을 준다
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileTap={{ scale: PRESS_SCALE }}
      transition={DOCK_PRESS}
      className="flex h-11 items-center justify-center gap-1.5 rounded-[10px] bg-primary bg-linear-to-r from-primary/20 to-white/20 font-semibold text-on-primary"
    >
      {children}
      <ExternalIcon />
    </motion.a>
  )
}
