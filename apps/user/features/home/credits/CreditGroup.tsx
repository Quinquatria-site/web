import type { ReactNode } from 'react'
import { lightAt } from './credit-light'

// 피그마 image 46 의 8갈래 별. 위아래·좌우로 길고 대각선은 짧으며 아래 갈래가 위보다 길다
const STAR =
  'polygon(49.5% 7.4%, 52.4% 36.1%, 69.1% 24.4%, 55.8% 40.2%, 87.1% 42.9%, 55.8% 45.8%, 69.1% 61.4%, 52.5% 49.3%, 49.5% 88.6%, 46.4% 49.3%, 29.9% 61.4%, 43.1% 45.8%, 11.8% 42.9%, 43.1% 40.2%, 29.9% 24.4%, 46.4% 36.1%)'

// 묶음 맨 위에서 각 줄까지의 거리(px). 빛이 이 순서로 닿는다
const OFFSET = { lineTop: 0, star: 27, lineBottom: 61, title: 93, organization: 123 }

/** 별 위아래로 흐려지는 세로선을 둔 구분 장식. 피그마 Line 5·6 은 #545454 에서 흰색으로 번지는 1px 선이다 */
function SparkleOrnament({ top }: { top: number }) {
  return (
    <div aria-hidden className="flex w-[29px] flex-col items-center gap-[3px]">
      <span
        className="credit-line-light h-6 w-px bg-linear-to-b from-[#545454] to-white"
        style={lightAt(top + OFFSET.lineTop)}
      />
      <span className="credit-twinkle" style={lightAt(top + OFFSET.star)}>
        <span className="block h-[30px] w-[29px] bg-white" style={{ clipPath: STAR }} />
      </span>
      <span
        className="credit-line-light mt-px h-6 w-px bg-linear-to-b from-white to-[#545454]"
        style={lightAt(top + OFFSET.lineBottom)}
      />
    </div>
  )
}

/** 크레딧 한 묶음. 장식 · 영문 제목 · 단체명 · 이름들 · 인스타그램 버튼을 가운데로 쌓는다. top 은 크레딧 칸 안에서 묶음이 시작하는 높이 */
export function CreditGroup({
  top,
  title,
  organization,
  children,
  instagram,
}: {
  top: number
  title: string
  organization: string
  children?: ReactNode
  instagram: { label: string; href: string }
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <SparkleOrnament top={top} />
      <div className="flex flex-col items-center gap-5 text-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-2 text-base leading-[normal]">
            <p
              className="credit-shimmer font-cinzel tracking-[0.12em]"
              style={lightAt(top + OFFSET.title)}
            >
              {title}
            </p>
            <p
              className="credit-shimmer font-paperlogy font-light tracking-[0.04em]"
              style={lightAt(top + OFFSET.organization)}
            >
              {organization}
            </p>
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
