const COUNCIL_INSTAGRAM = 'https://www.instagram.com/hufsstudent/'
const COUNCIL_PHONE = '010-9411-4793'

const BUTTON =
  'flex h-7 items-center rounded-2xl bg-accent px-4 text-xs leading-[normal] font-medium tracking-[0.12em] whitespace-nowrap text-on-accent shadow-[0_2px_4px_rgb(0_0_0/0.25)]'

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
        <a href={COUNCIL_INSTAGRAM} target="_blank" rel="noopener noreferrer" className={BUTTON}>
          {instagramLabel}
        </a>
        <a href={`tel:${COUNCIL_PHONE}`} className={BUTTON}>
          {callLabel}
        </a>
      </div>
    </section>
  )
}
