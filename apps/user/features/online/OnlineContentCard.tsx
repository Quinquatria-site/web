'use client'

import { motion } from 'motion/react'
import { DOCK_PRESS, PRESS_SCALE } from '@/shared/dock/dock-motion'

/** 바깥으로 나가는 링크라는 표시. 글자로 이미 알려 읽지 않는다 */
function ExternalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="size-5 shrink-0 text-secondary"
    >
      <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7ZM19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7Z" />
    </svg>
  )
}

/** 온라인 콘텐츠 카드 한 장. 누르면 바깥 주소를 새 탭으로 연다 */
export function OnlineContentCard({
  href,
  title,
  description,
}: {
  href: string
  title: string
  description: string
}) {
  return (
    // 누르는 동안 도크와 같은 스프링으로 살짝 줄어 손끝 반응을 준다
    <motion.div whileTap={{ scale: PRESS_SCALE }} transition={DOCK_PRESS}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-22 items-center gap-3 rounded-xl border border-(--beige-yellow) bg-(--warm-white) py-3 pr-3 pl-[15px] text-text"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="leading-[1.2] font-semibold">{title}</p>
          <p className="text-xs leading-[1.18] text-text-muted">{description}</p>
        </div>
        <ExternalIcon />
      </a>
    </motion.div>
  )
}
