import Link from 'next/link'
import type { Ref } from 'react'
import type { PageItem } from '@/libs/routes'

export function PreviewSection({ item, ref }: { item: PageItem; ref?: Ref<HTMLElement> }) {
  return (
    <section ref={ref} className="flex h-full flex-col gap-4 border-b border-line px-5 pt-10 pb-24">
      <h2 className="text-[22px] leading-7 font-semibold tracking-tight">{item.label}</h2>
      <p className="text-sm text-ink-muted">{item.summary}</p>
      <Link
        href={item.href}
        className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-surface-muted"
      >
        <span className="text-sm text-ink-muted">미리보기 자리</span>
        <span className="text-sm font-medium text-accent">보러 가기</span>
      </Link>
    </section>
  )
}
