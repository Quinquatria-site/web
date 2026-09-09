'use client'

import Image from 'next/image'
import { useLang } from '@/components/lang-provider'
import type { Artist } from '@/mocks/types'
import { timeRange } from '../libs/schedule'

export function NowPlaying({ artist, live }: { artist: Artist | null; live: boolean }) {
  const { lang, copy } = useLang()

  if (!artist) return <section className="h-1/3 shrink-0 border-b border-line" />

  return (
    <section className="flex h-1/3 shrink-0 items-center gap-4 border-b border-line px-5 pb-5">
      <div className="relative aspect-3/4 shrink-0 self-stretch overflow-hidden rounded-2xl bg-surface-muted">
        <Image src={artist.image} alt="" fill sizes="200px" className="object-cover" priority />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="self-start rounded-full bg-accent px-2.5 py-1 text-[11px] leading-4 font-medium text-accent-ink">
          {live ? copy.timeline.live : copy.timeline.opening}
        </span>
        <h2 className="mt-2 truncate text-xl leading-7 font-semibold tracking-tight">
          {artist.name[lang]}
        </h2>
        <p className="mt-1 truncate text-[13px] leading-5 text-ink-muted tabular-nums">
          {timeRange(artist)} · {artist.place[lang]}
        </p>
        <p className="mt-2 line-clamp-3 text-[13px] leading-5 text-ink-muted">
          {artist.intro[lang]}
        </p>
      </div>
    </section>
  )
}
