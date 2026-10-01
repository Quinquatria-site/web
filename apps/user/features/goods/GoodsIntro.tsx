import { LinkBadge } from '@/shared/link-badge/LinkBadge'

/** 굿즈 탭 맨 위 소개 카드. 행사 이름·안내 한 줄과 판매 장소로 가는 배지를 둔다 */
export function GoodsIntro({
  title,
  subtitle,
  salesLabel,
  salesHref,
}: {
  title: string
  subtitle: string
  salesLabel: string
  salesHref: string
}) {
  return (
    <section className="flex flex-col rounded-xl bg-(--beige-peach) px-[22px] pt-3 pb-3 text-text">
      <div className="flex flex-col">
        <p className="text-xl leading-[1.08] font-semibold">{title}</p>
        <p className="leading-[1.288] font-medium">{subtitle}</p>
      </div>
      {/* 시안은 배지를 둘째 줄에 걸쳐 두지만 좁은 폰·영어에서 글자를 덮어 아래로 내린다 */}
      <div className="mt-1.5 self-end">
        <LinkBadge href={salesHref} tone="accent">
          {salesLabel}
        </LinkBadge>
      </div>
    </section>
  )
}
