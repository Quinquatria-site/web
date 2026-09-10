'use client'

import { motion } from 'motion/react'
import { useLang } from '@/components/lang-provider'
import type { FestivalEvent } from '@/mocks/types'
import { isAct, timeRange } from '../libs/schedule'

/** 카드 채움으로 학생 무대와 초청 무대를 가른다. */
const FILL: Record<'student' | 'celeb', string> = {
  student: 'border-line bg-surface',
  celeb: 'border-line bg-surface-muted',
}

export function ScheduleList({
  items,
  liveId,
  rowRef,
  onSelect,
}: {
  items: FestivalEvent[]
  liveId: string | null
  rowRef: (id: string, node: HTMLLIElement | null) => void
  onSelect: (event: FestivalEvent) => void
}) {
  const { lang } = useLang()

  return (
    <ol className="px-5">
      {items.map((event, index) => {
        const live = event.id === liveId
        const last = index === items.length - 1
        return (
          <li
            key={event.id}
            ref={(node) => {
              rowRef(event.id, node)
            }}
            className="relative scroll-mt-24 pb-3 pl-9"
          >
            {/* 레일. 항목마다 한 토막씩 이어 붙어 하나의 선으로 보인다 */}
            <span
              aria-hidden
              className={`absolute top-0 left-[5px] w-px bg-line ${last ? 'h-1/2' : 'h-full'}`}
            />

            <div className="relative">
              <span
                aria-hidden
                className={`absolute top-1/2 -left-9 size-[11px] -translate-y-1/2 rounded-pill ${
                  live ? 'bg-accent' : 'bg-ink-muted/45'
                }`}
              >
                {/* 진행 중인 무대에서만 점이 물결처럼 번진다 */}
                {live && (
                  <motion.span
                    className="absolute inset-0 rounded-pill bg-accent"
                    animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
              </span>

              {isAct(event) ? (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.985 }}
                  onClick={() => onSelect(event)}
                  aria-current={live ? 'true' : undefined}
                  className={`relative flex w-full items-center justify-center gap-3 rounded-control border px-4 py-3.5 ${
                    live
                      ? 'border-accent bg-accent text-accent-ink'
                      : FILL[event.kind === 'celeb' ? 'celeb' : 'student']
                  }`}
                >
                  <span
                    className={`shrink-0 text-[13px] leading-5 tabular-nums ${
                      live ? 'text-accent-ink/80' : 'text-ink-muted'
                    }`}
                  >
                    {timeRange(event)}
                  </span>
                  <span className="min-w-0 truncate text-[15px] leading-5 font-medium">
                    {event.name[lang]}
                  </span>

                  {/* 테두리가 천천히 밝아졌다 잦아든다 */}
                  {live && (
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute -inset-px rounded-control ring-2 ring-accent"
                      animate={{ opacity: [0.2, 0.9, 0.2] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                </motion.button>
              ) : (
                // 공연이 아닌 일정은 눌러도 열 것이 없어 글로만 놓는다
                <p className="flex items-center justify-center gap-3 py-2.5 text-ink-muted">
                  <span className="shrink-0 text-[13px] leading-5 tabular-nums">
                    {timeRange(event)}
                  </span>
                  <span className="min-w-0 truncate text-[14px] leading-5">{event.name[lang]}</span>
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
