import { LinkBadge } from '@/shared/link-badge/LinkBadge'

const COUNCIL_INSTAGRAM = 'https://www.instagram.com/hufsstudent/'
const COUNCIL_PHONE = '010-9411-4793'

/** 분실물 목록 위 문의 안내. 총학생회 인스타그램으로 가거나 바로 전화를 건다 */
export function LostItemsContact({
  notice,
  instagramLabel,
  callLabel,
}: {
  notice: string
  instagramLabel: string
  callLabel: string
}) {
  return (
    <section className="flex flex-col gap-2">
      <p className="leading-[normal] font-medium text-secondary">{notice}</p>
      <div className="flex flex-wrap gap-2">
        <LinkBadge href={COUNCIL_INSTAGRAM} tone="accent">
          {instagramLabel}
        </LinkBadge>
        <LinkBadge href={`tel:${COUNCIL_PHONE}`} tone="accent">
          {callLabel}
        </LinkBadge>
      </div>
    </section>
  )
}
