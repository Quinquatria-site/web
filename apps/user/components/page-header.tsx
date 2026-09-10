'use client'

import { PAGE_ICONS } from '@/components/icons'
import { useLang } from '@/components/lang-provider'
import type { PagePath } from '@/libs/routes'

/**
 * 화면마다 맨 위에 한 줄. 이름·설명·아이콘을 경로 하나로 끌어온다.
 * dock 의 탭, 홈의 카드, 이 헤더가 모두 같은 아이콘과 문구를 쓴다.
 */
export function PageHeader({ path }: { path: PagePath }) {
  const { copy } = useLang()
  const { label, summary } = copy.pages[path]
  const Icon = PAGE_ICONS[path]

  return (
    <header className="flex shrink-0 items-center gap-3.5 border-b liquid-glass liquid-glass--panel px-5 pt-[calc(env(safe-area-inset-top)+22px)] pb-5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl liquid-glass liquid-glass--control">
        <Icon className="h-5 w-5 text-accent" />
      </span>
      <div className="min-w-0">
        <h1 className="text-[21px] leading-7 font-semibold tracking-tight">{label}</h1>
        <p className="mt-0.5 text-[13px] leading-5 text-ink-muted">{summary}</p>
      </div>
    </header>
  )
}
