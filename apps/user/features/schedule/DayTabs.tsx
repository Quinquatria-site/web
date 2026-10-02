'use client'

import { cinzel } from '@/shared/fonts'
import { HTML_LANG, type Locale } from '@/shared/i18n/locales'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { FESTIVAL_DAYS } from './festival-days'
import { pretendardLight } from './fonts'

/** 탭이 가리키는 일정 영역 id */
export const SCHEDULE_PANEL_ID = 'schedule-panel'

/** DAY 탭 버튼 id. 일정 영역이 어느 탭의 내용인지 이어 준다 */
export const dayTabId = (day: number) => `day-tab-${day}`

// 날짜를 서울 기준으로 읽어야 기기 시간대가 달라도 요일이 밀리지 않는다. 한국어는 시안대로 영문 요일을 쓴다
const weekday = (locale: Locale, date: string) =>
  new Intl.DateTimeFormat(locale === 'ko' ? 'en-US' : HTML_LANG[locale], {
    weekday: 'short',
    timeZone: 'Asia/Seoul',
  }).format(new Date(`${date}T12:00:00+09:00`))

// 겹쳐 둔 알약 한 장. lag 면 90ms 늦게 출발해 앞장과 벌어진 만큼 알약이 늘어나 보인다
function PillPiece({ atSecond, lag }: { atSecond: boolean; lag: boolean }) {
  return (
    <span
      aria-hidden
      className={`absolute inset-y-[3px] left-[3px] w-[calc(50%-7px)] rounded-full bg-(--brown) transition-[translate] duration-[425ms] ease-day-spring motion-reduce:transition-none ${atSecond ? 'translate-x-[calc(100%+8px)]' : ''} ${lag ? 'delay-90' : ''}`}
    />
  )
}

/** DAY 1 · DAY 2 탭. 선택 알약이 가는 쪽 끝부터 늘어났다 줄어들며 옮겨 간다 */
export function DayTabs({ value, onChange }: { value: number; onChange: (day: number) => void }) {
  const locale = useLocale()
  const toSecond = value === 1
  return (
    <div
      role="tablist"
      aria-label={getMessages(locale).schedule.dayTabsLabel}
      className={`${cinzel.variable} ${pretendardLight.variable} relative grid h-[52px] grid-cols-2 gap-2 rounded-full border border-(--brown) bg-[rgb(87_74_83/0.2)] p-[3px] shadow-[0_4px_6px_rgb(0_0_0/0.25)]`}
    >
      {/* 가는 쪽 장이 먼저, 반대쪽 장이 늦게 출발한다. 폭 대신 transform 만 움직여 레이아웃을 다시 계산하지 않는다 */}
      <PillPiece atSecond={toSecond} lag={toSecond} />
      <PillPiece atSecond={toSecond} lag={!toSecond} />
      {FESTIVAL_DAYS.map(({ date }, i) => {
        const selected = i === value
        return (
          <button
            key={date}
            type="button"
            id={dayTabId(i)}
            role="tab"
            aria-selected={selected}
            aria-controls={SCHEDULE_PANEL_ID}
            onClick={() => onChange(i)}
            className="relative flex items-center justify-center gap-1 leading-[normal]"
          >
            <span className="font-cinzel text-xl font-bold text-text-inverse">DAY {i + 1}</span>
            <span className="font-(family-name:--pretendard-light) text-xs font-light text-[#dbdbdb]">
              {weekday(locale, date)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
