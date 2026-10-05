import type { ReactNode } from 'react'

/** 온라인 콘텐츠 카드 틀. 공지·홈 카드처럼 햇빛 그라데이션(20%)을 깐다 */
export function OnlineCard({ children }: { children: ReactNode }) {
  return (
    <article className="overflow-hidden rounded-xl border border-(--beige-yellow) bg-(--warm-white) bg-linear-to-r from-(--warm-white)/20 to-(--sunlight)/20 text-text">
      {children}
    </article>
  )
}

/** 카드 제목과 한 줄 소개 */
export function OnlineCardHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-lg leading-[1.2] font-semibold">{title}</p>
      <p className="text-[13px] text-text-muted">{description}</p>
    </div>
  )
}

/** 진행 기간·참여 경로 같은 이름과 값 줄 */
export function OnlineCardInfo({ rows }: { rows: { term: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-1.5 text-[13px] leading-[1.35]">
      {rows.map(({ term, value }) => (
        <div key={term} className="contents">
          <dt className="text-text-muted">{term}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
