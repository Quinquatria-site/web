'use client'

import { NoticeIcon, PinIcon } from '@/components/icons'
import { useLang } from '@/components/lang-provider'
import { DOCK_TIER_BOTTOM } from '@/libs/dock'
import type { Notice } from '@/mocks/types'
import { noticeDate } from '../libs/notices'

export function NoticeDetail({ notice }: { notice: Notice }) {
  const { lang, copy } = useLang()
  const pinned = notice.kind === 'pinned'

  return (
    <article
      className="mx-5 pt-[calc(env(safe-area-inset-top)+32px)]"
      style={{ paddingBottom: DOCK_TIER_BOTTOM }}
    >
      <div className="bg-surface rounded-panel border border-line p-5">
        <header className="border-b border-line pb-5">
          {/* 상세로 바로 들어와도 어느 화면 안인지 먼저 읽힌다 */}
          <p className="flex items-center gap-1.5 text-[12px] leading-4 font-medium text-ink-muted">
            <NoticeIcon className="size-3.5" />
            {copy.pages['/notice'].label}
          </p>

          <p className="mt-3 flex items-center gap-2 text-[12px] leading-4">
            {pinned && (
              <span className="flex items-center gap-1 font-medium text-accent">
                <PinIcon className="size-3.5" />
                {copy.notice.pinned}
              </span>
            )}
            <span className="text-ink-muted tabular-nums">{noticeDate(notice.date)}</span>
          </p>
          <h1 className="mt-2 text-[22px] leading-8 font-semibold tracking-tight">
            {notice.title[lang]}
          </h1>
        </header>

        <div className="flex flex-col gap-4 pt-5 text-[14px] leading-7 text-ink-muted">
          {notice.body.map((paragraph, index) => (
            <p key={index}>{paragraph[lang]}</p>
          ))}
        </div>
      </div>
    </article>
  )
}
