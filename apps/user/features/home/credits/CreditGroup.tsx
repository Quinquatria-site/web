import type { ReactNode } from 'react'
import { CreditReveal, CreditRevealItem } from './CreditReveal'
import { SparkleOrnament } from '@/shared/ornament/SparkleOrnament'

/** 크레딧 한 묶음. 장식 · 영문 제목 · 단체명 · 이름들 · 인스타그램 버튼을 가운데로 쌓고 스크롤해 닿으면 차례로 띄운다 */
export function CreditGroup({
  title,
  organization,
  children,
  instagram,
}: {
  title: string
  organization: string
  children?: ReactNode
  instagram: { label: string; href: string }
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
        <CreditRevealItem>
          <a
            href={instagram.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl border border-primary-border bg-primary px-4 py-1 font-paperlogy text-sm leading-[normal] tracking-[0.12em] text-on-primary"
          >
            {instagram.label}
          </a>
        </CreditRevealItem>
      </div>
    </CreditReveal>
  )
}
