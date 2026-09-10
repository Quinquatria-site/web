import Image from 'next/image'
import Link from 'next/link'
import { HomeIcon } from '@/components/icons'
import { DOCK_GAP, DOCK_HEIGHT } from '@/libs/dock'
import { COPY, type Lang } from '@/libs/i18n'
import { langHref } from '@/libs/routes'

export default async function Page({ params }: PageProps<'/[lang]/admin'>) {
  const { lang } = (await params) as { lang: Lang }
  const { admin } = COPY[lang]

  return (
    <section
      className="flex min-h-full flex-col items-center justify-center px-8 text-center"
      // dock 이 버튼을 덮지 않게 한 층만큼 비운다
      style={{
        paddingBottom: `calc(${DOCK_GAP + DOCK_HEIGHT + 16}px + env(safe-area-inset-bottom))`,
      }}
    >
      <p className="font-display text-[12px] leading-4 tracking-[0.32em] text-ink-muted">ADMIN</p>

      <div className="relative mt-6 size-40 overflow-hidden rounded-full border liquid-glass">
        <Image
          src="/me.png"
          alt={admin.portrait}
          fill
          sizes="160px"
          className="object-cover object-top"
        />
      </div>

      <p className="mt-7 text-[20px] leading-7 font-semibold tracking-tight">{admin.message}</p>
      <p className="mt-2 text-[13px] leading-5 text-ink-muted">{admin.note}</p>

      <Link
        href={langHref(lang)}
        className="mt-8 flex h-12 items-center gap-2 rounded-full liquid-glass liquid-glass--control liquid-glass--selected px-6 text-[15px] font-semibold text-accent-ink"
      >
        <HomeIcon className="h-5 w-5" />
        {admin.toHome}
      </Link>
    </section>
  )
}
