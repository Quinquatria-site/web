import { heirOfLight } from '@/shared/fonts/heir-of-light'

type Credit = { ko: string; en: string; zh: string }

// 언어를 바꿔도 세 언어를 한꺼번에 보여 주는 고정 문구라 messages 로 옮기지 않는다
const FESTIVAL: Credit = {
  ko: '2026 한국외국어대학교 서울캠퍼스 대동제',
  en: '2026 HUFS Seoul Campus Festival',
  zh: '2026年韩国外国语大学首尔校区校园庆典',
}
const HOSTS: Credit[] = [
  {
    ko: '한국외국어대학교 서울캠퍼스 멋쟁이사자처럼',
    en: 'LIKELION, HUFS Seoul Campus',
    zh: '韩国外国语大学首尔校区 LIKELION',
  },
  {
    ko: '한국외국어대학교 서울캠퍼스 제60대 총학생회 ‘선명’',
    en: 'Seonmyeong, The 60th HUFS Campus Student Council',
    zh: '韩国外国语大学首尔校区第60届学生会‘선명’',
  },
]

function CreditLines({ credit }: { credit: Credit }) {
  return (
    <p className="flex flex-col">
      <span lang="ko" className="font-heir">
        {credit.ko}
      </span>
      <span lang="en" className="mt-0.5 font-heir">
        {credit.en}
      </span>
      {/* 빛의 계승자체로 쓰면 줄간격이 어긋나 중국어만 Pretendard 로 쓰고, 피그마대로 간격도 따로 둔다 */}
      <span lang="zh" className="mt-[7px] font-sans">
        {credit.zh}
      </span>
    </p>
  )
}

/** PC 화면에서 앱 기둥 양옆을 채우는 하늘 배경과 행사·주최 문구. 폰 너비에서는 이미지를 받지도 그리지도 않는다 */
export function WebBackdrop() {
  return (
    <>
      {/* url 을 pc: 미디어 쿼리 안에만 둬야 폰에서 이미지 요청이 나가지 않는다 */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20 bg-cover bg-center pc:bg-[url(/web-sky.webp)]"
      />
      {/* 기둥 안은 원래 바탕색으로 덮어 하늘 이미지가 비치지 않게 한다 */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-y-0 left-1/2 -z-20 hidden w-(--app-max-width) -translate-x-1/2 bg-bg pc:block"
      />
      <div
        className={`${heirOfLight.variable} pointer-events-none hidden text-xs leading-[normal] text-(--brick) pc-lg:block`}
      >
        <div className="fixed top-1/2 right-[calc(50%+var(--app-max-width)/2+55px)] text-right">
          <CreditLines credit={FESTIVAL} />
        </div>
        <div className="fixed bottom-[45px] left-[calc(50%+var(--app-max-width)/2+55px)] flex flex-col gap-[29px]">
          {HOSTS.map((host) => (
            <CreditLines key={host.en} credit={host} />
          ))}
        </div>
      </div>
    </>
  )
}
