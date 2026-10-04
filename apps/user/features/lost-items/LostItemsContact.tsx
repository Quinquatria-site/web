import { LinkBadge } from '@/shared/link-badge/LinkBadge'

const COUNCIL_INSTAGRAM = 'https://www.instagram.com/hufsstudent/'
const COUNCIL_KAKAO = 'https://pf.kakao.com/_bwFxjX'

/** 분실물 목록 위 문의 안내. 총학생회 인스타그램이나 카카오톡 채널로 보낸다 */
export function LostItemsContact({
  notice,
  instagramLabel,
  kakaoLabel,
}: {
  notice: string
  instagramLabel: string
  kakaoLabel: string
}) {
  return (
    <section className="flex flex-col gap-2">
      <p className="leading-[normal] text-text-inverse">{notice}</p>
      <div className="flex flex-wrap gap-2">
        <LinkBadge href={COUNCIL_INSTAGRAM} tone="glow">
          {instagramLabel}
        </LinkBadge>
        <LinkBadge href={COUNCIL_KAKAO} tone="glow">
          {kakaoLabel}
        </LinkBadge>
      </div>
    </section>
  )
}
