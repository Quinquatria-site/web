'use client'

import Link from 'next/link'
import type { Ref } from 'react'
import { useLang } from '@/components/lang-provider'
import { ChevronRightIcon, PAGE_ICONS } from '@/components/icons'
import { DOCK_GAP, DOCK_HEIGHT } from '@/libs/dock'
import { langHref, PAGE_PATHS } from '@/libs/routes'

export function NavSection({ ref }: { ref?: Ref<HTMLElement> }) {
  const { lang, copy } = useLang()

  return (
    <section
      ref={ref}
      className="flex h-full flex-col gap-3 px-5 pt-6"
      // 마지막 줄이 dock 에 가리지 않게 한 층만큼 더 비운다
      style={{
        paddingBottom: `calc(${DOCK_GAP + DOCK_HEIGHT + 16}px + env(safe-area-inset-bottom))`,
      }}
    >
      {PAGE_PATHS.map((path) => {
        const Icon = PAGE_ICONS[path]
        const { label, summary } = copy.pages[path]
        return (
          <Link
            key={path}
            href={langHref(lang, path)}
            className="flex flex-1 items-center gap-4 rounded-banner border border-line bg-surface px-7"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-control bg-surface-muted">
              <Icon className="h-5 w-5 text-accent" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] leading-6 font-semibold tracking-tight">
                {label}
              </span>
              <span className="mt-0.5 block text-[13px] leading-5 text-ink-muted">{summary}</span>
            </span>
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-muted" />
          </Link>
        )
      })}
    </section>
  )
}
