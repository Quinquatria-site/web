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
  // 상시는 아래 카드가 지나가는 자리라 바탕이 비쳐서는 안 된다
  const pinned = notice.kind === 'pinned'

  return (
    <MotionLink
      href={noticeHref(lang, notice.id)}
      whileTap={{ scale: 0.985 }}
      className={`flex items-center gap-3.5 rounded-2xl border px-4 py-4 ${
        pinned
          ? 'border-accent/45 bg-surface shadow-[0_8px_24px_rgba(28,14,2,0.12)]'
          : 'border-line bg-surface-muted'
      }`}
    >
      {pinned && (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
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
