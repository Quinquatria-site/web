import Link from 'next/link'
import { PAGE_ICONS } from '@/components/icons'
import { PAGE_ITEMS } from '@/libs/routes'

export function NavGrid() {
  return (
    <nav
      className="mt-auto grid grid-cols-2 gap-3 px-5 pt-6"
      style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}
    >
      {PAGE_ITEMS.map((item) => {
        const Icon = PAGE_ICONS[item.href]
        return (
          <Link
            key={item.href}
            href={item.href}
            // 히어로 이미지 위에 얹히는 카드라 배경을 비우고 흐린다
            className="flex min-h-[108px] flex-col justify-between rounded-2xl border border-hero-ink/20 bg-hero-shade/35 p-4 backdrop-blur-md"
          >
            <Icon className="h-5 w-5 text-hero-ink-muted" />
            <div>
              <p className="text-[15px] leading-5 font-medium text-hero-ink">{item.label}</p>
              <p className="mt-1 text-[12px] leading-4 text-hero-ink-muted">{item.summary}</p>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
