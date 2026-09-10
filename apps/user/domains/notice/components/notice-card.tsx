'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { ChevronRightIcon, PinIcon } from '@/components/icons'
import { useLang } from '@/components/lang-provider'
import { noticeHref } from '@/libs/routes'
import type { Notice } from '@/mocks/types'
import { noticeDate } from '../libs/notices'

const MotionLink = motion.create(Link)

export function NoticeCard({ notice }: { notice: Notice }) {
  const { lang, copy } = useLang()
  // 겹쳐지는 상시 공지는 불투명 배경으로 본문을 읽기 쉽게 한다.
  const pinned = notice.kind === 'pinned'

  return (
    <MotionLink
      href={noticeHref(lang, notice.id)}
      whileTap={{ scale: 0.985 }}
      className={`flex items-center gap-3.5 rounded-card border px-4 py-4 ${
        pinned ? 'border-accent/45 bg-surface' : 'border-line bg-surface'
      }`}
    >
      {pinned && (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-surface-muted text-accent">
          <PinIcon className="size-[18px]" />
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-[12px] leading-4">
          {pinned && <span className="font-medium text-accent">{copy.notice.pinned}</span>}
          <span className="text-ink-muted tabular-nums">{noticeDate(notice.date)}</span>
        </span>
        <span className="mt-1 block truncate text-[16px] leading-6 font-semibold tracking-tight">
          {notice.title[lang]}
        </span>
        {/* block 은 line-clamp 의 display 를 덮어써 자르기를 없앤다. 붙이지 않는다 */}
        <span className="mt-1 line-clamp-2 text-[13px] leading-5 text-ink-muted">
          {notice.body[0][lang]}
        </span>
      </span>

      <ChevronRightIcon className="size-5 shrink-0 text-ink-muted" />
    </MotionLink>
  )
}
