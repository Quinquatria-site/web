'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { DOCK_PRESS, PRESS_SCALE } from '@/shared/dock/dock-motion'
import { getMessages } from '@/shared/i18n/messages'
import { localePath } from '@/shared/i18n/paths'
import { useLocale } from '@/shared/i18n/useLocale'
import { ChevronRightIcon } from '@/shared/icons/ChevronRightIcon'
import { formatSeoulTime } from '@/shared/time/format-seoul-time'
import type { Notice } from './notice'

/** 공지 목록의 카드 한 장. 상단 고정 공지는 중요 배지와 짙은 배경으로 일반 공지와 가른다 */
export function NoticeCard({ notice }: { notice: Notice }) {
  const locale = useLocale()
  const { notices } = getMessages(locale)
  const important = notice.type === 'PERMANENT'
  return (
    // 누르는 동안 도크와 같은 스프링으로 살짝 줄어 손끝 반응을 준다
    <motion.div whileTap={{ scale: PRESS_SCALE }} transition={DOCK_PRESS}>
      <Link
        href={localePath(locale, `/notices/${notice.id}`)}
        className={`flex min-h-22 items-center gap-3 rounded-xl border border-[#e5bf8f] py-3 pr-2.5 pl-[15px] ${important ? 'bg-(--beige-peach)' : 'bg-(--warm-white)'}`}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="flex items-center gap-2">
            {important && (
              <span className="rounded-xl bg-accent px-2 py-1 text-[10px] leading-[normal] font-semibold whitespace-nowrap text-on-accent">
                {notices.important}
              </span>
            )}
            <time
              dateTime={notice.created_at}
              className="text-xs leading-[1.18] whitespace-nowrap text-text-muted"
            >
              {formatSeoulTime(notice.created_at, { withDate: true })}
            </time>
          </p>
          {/* 줄 높이를 고정해야 이모지·한자처럼 다른 글꼴로 그려지는 제목도 카드 높이가 같다 */}
          <p className="truncate leading-[1.2] font-semibold text-secondary">{notice.title}</p>
          {/* 본문이 비어도 한 줄 자리를 남겨 제목 위치가 다른 카드와 맞는다 */}
          <p className="min-h-lh truncate text-xs leading-[1.18] text-text-muted">
            {notice.content}
          </p>
        </div>
        <ChevronRightIcon />
      </Link>
    </motion.div>
  )
}
