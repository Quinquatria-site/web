import type { ReactNode } from 'react'
import { CreditReveal, CreditRevealItem } from './CreditReveal'
import { LinkBadge } from '@/shared/link-badge/LinkBadge'
import { SparkleOrnament } from '@/shared/ornament/SparkleOrnament'

/** 크레딧 한 묶음. 장식 · 영문 제목 · 단체명 · 이름들 · 링크 버튼들을 가운데로 쌓고 스크롤해 닿으면 차례로 띄운다 */
export function CreditGroup({
  title,
  organization,
  children,
  links,
}: {
  title: string
  organization: string
  children?: ReactNode
  links: { label: string; href: string }[]
}) {
  return (
    <CreditReveal className="flex flex-col items-center gap-2">
      <CreditRevealItem>
        <SparkleOrnament />
      </CreditRevealItem>
      <div className="flex flex-col items-center gap-5 text-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-2 text-base leading-[normal]">
            <CreditRevealItem>
              <p className="font-cinzel tracking-[0.12em]">{title}</p>
            </CreditRevealItem>
            <CreditRevealItem>
              <p className="font-paperlogy font-light tracking-[0.04em]">{organization}</p>
            </CreditRevealItem>
          </div>
          {children && <CreditRevealItem>{children}</CreditRevealItem>}
        </div>
        <div className="flex flex-col items-center gap-2">
          {links.map((link) => (
            <CreditRevealItem key={link.href}>
              <LinkBadge href={link.href} tone="primary">
                {link.label}
              </LinkBadge>
            </CreditRevealItem>
          ))}
        </div>
      </div>
    </CreditReveal>
  )
}
