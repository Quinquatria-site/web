import Link from 'next/link'
import type { ReactNode } from 'react'
import { paperlogy } from '@/shared/fonts/paperlogy'

// primary 는 어두운 크레딧 위 노란 배지, accent 는 밝은 화면 위 적갈색 배지, glow 는 저녁 하늘 위 햇빛 배지
const TONE = {
  primary: 'bg-primary text-sm text-black',
  accent: 'bg-accent text-xs text-on-accent shadow-[0_2px_4px_rgb(0_0_0/0.25)]',
  glow: 'bg-primary bg-linear-to-r from-primary/20 to-white/20 text-xs text-text shadow-[0_2px_4px_rgb(0_0_0/0.25)]',
}

const BASE =
  'inline-flex h-7 items-center rounded-2xl px-4 font-paperlogy leading-[normal] tracking-[0.12em] whitespace-nowrap'

/** 끝에 → 가 붙은 알약 모양 링크. 앱 안 경로는 Link, 외부 주소는 새 탭, tel: 같은 주소는 그대로 연다 */
export function LinkBadge({
  href,
  tone,
  children,
}: {
  href: string
  tone: keyof typeof TONE
  children: ReactNode
}) {
  // 글꼴 변수를 배지에만 달아 배지가 없는 페이지는 Paperlogy 를 받지 않는다
  const className = `${paperlogy.variable} ${BASE} ${TONE[tone]}`
  // 한 span 으로 묶어야 flex 가 화살표 앞 띄어쓰기를 지우지 않는다. 화살표는 꾸밈이라 읽지 않는다
  const label = (
    <span>
      {children}
      <span aria-hidden> →</span>
    </span>
  )

  if (href.startsWith('/')) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    )
  }
  const external = href.startsWith('http')
  return (
    <a
      href={href}
      className={className}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {label}
    </a>
  )
}
