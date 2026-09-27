import type { ReactNode } from 'react'
import { SparkleOrnament } from './SparkleOrnament'

/** 크레딧 한 묶음. 장식 · 영문 제목 · 단체명 · 이름들 · 인스타그램 버튼을 가운데로 쌓는다 */
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
    <div className="flex flex-col items-center gap-2">
      <SparkleOrnament />
      <div className="flex flex-col items-center gap-5 text-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-2 text-base leading-[normal]">
            <p className="font-cinzel tracking-[0.12em]">{title}</p>
            <p className="font-paperlogy font-light tracking-[0.04em]">{organization}</p>
          </div>
          {children}
        </div>
        <a
          href={instagram.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-primary px-4 py-1 font-paperlogy text-xs leading-[normal] tracking-[0.12em] text-primary"
        >
          {instagram.label}
        </a>
      </div>
    </div>
  )
}
