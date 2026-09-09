import Link from 'next/link'
import { PAGE_ICONS } from '@/components/icons'
import { COPY, type Lang } from '@/libs/i18n'
import { langHref, PAGE_PATHS } from '@/libs/routes'

export function NavGrid({ lang }: { lang: Lang }) {
  const copy = COPY[lang]

  return (
    <nav
      className="mt-auto grid grid-cols-2 gap-3 px-5 pt-6"
      style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}
    >
      {PAGE_PATHS.map((path) => {
        const Icon = PAGE_ICONS[path]
        const { label, summary } = copy.pages[path]
        return (
          <Link
            key={path}
            href={langHref(lang, path)}
            // 히어로 이미지 위에 얹히는 카드라 배경을 비우고 흐린다
            className="flex min-h-[108px] flex-col justify-between rounded-2xl border border-hero-ink/20 bg-hero-shade/35 p-4 backdrop-blur-md"
          >
            <Icon className="h-5 w-5 text-hero-ink-muted" />
            <div>
              <p className="text-[15px] leading-5 font-medium text-hero-ink">{label}</p>
              <p className="mt-1 text-[12px] leading-4 text-hero-ink-muted">{summary}</p>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
