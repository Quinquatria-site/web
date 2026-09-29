import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages } from '@/shared/i18n/messages'
import { ClockDot } from './ClockDot'
import type { Performance } from './performance'
import { PerformanceCard } from './PerformanceCard'
import { TIMELINE_SLOTS, type TimelineSlot } from './timeline-slots'
import { TimelineDot } from './TimelineDot'

/** 타임라인 공연 줄의 id. 배너가 이 줄로 옮겨 갈 때 쓴다 */
export const performanceAnchorId = (id: number) => `performance-${id}`

type TextSlot = Extract<TimelineSlot, { text: string }>

type Row = { key: string; time: string | null } & (
  { text: TextSlot['text']; start: number; end: number | null } | { performance: Performance }
)

// 서울 기준 그날 그 시각. 기기 시간대와 상관없이 같은 순간을 가리킨다
const at = (date: string, time: string) => new Date(`${date}T${time}:00+09:00`).getTime()

// 문구 칸은 다음 칸 시각 전까지 진행 중이다. 공연이 없는 종류는 칸째 숨긴다
function toRows(date: string, performances: Performance[]): Row[] {
  return TIMELINE_SLOTS.flatMap((slot, i): Row[] => {
    if ('text' in slot) {
      const next = TIMELINE_SLOTS[i + 1]
      return [
        {
          key: slot.time,
          time: slot.time,
          text: slot.text,
          start: at(date, slot.time),
          end: next ? at(date, next.time) : null,
        },
      ]
    }
    return performances
      .filter((p) => p.type === slot.performances)
      .map((p, j) => ({ key: `p${p.id}`, time: j === 0 ? slot.time : null, performance: p }))
  })
}

/** 하루 타임라인. 고정 문구 사이에 종류별 공연을 seq 순으로 끼워 넣고, 진행 중인 줄의 점을 반짝인다 */
export async function Timeline({
  date,
  performances,
}: {
  date: string
  performances: Performance[]
}) {
  const { slots } = getMessages(await getLocale()).schedule
  const rows = toRows(date, performances)
  return (
    <ol className="flex flex-col gap-[3px] text-secondary">
      {rows.map((row, i) => (
        <li
          key={row.key}
          id={'performance' in row ? performanceAnchorId(row.performance.id) : undefined}
          className="grid h-10 scroll-mt-6 grid-cols-[40px_35px_1fr] items-center"
        >
          <span className="pl-0.5 text-xs leading-[normal]">{row.time}</span>
          <span className="relative flex h-full items-center justify-center">
            {'text' in row ? (
              <ClockDot start={row.start} end={row.end} />
            ) : (
              <TimelineDot active={row.performance.is_live} />
            )}
            {/* 점 아래 4px 을 띄우고 다음 줄 점 위 4px 까지 잇는다 */}
            {i < rows.length - 1 && (
              <span className="absolute top-[calc(50%+8px)] h-[27px] w-px bg-border-strong" />
            )}
          </span>
          {'text' in row ? (
            <span className="truncate pl-1.5 text-base leading-[normal]">{slots[row.text]}</span>
          ) : (
            <div className="pl-1">
              <PerformanceCard performance={row.performance} />
            </div>
          )}
        </li>
      ))}
    </ol>
  )
}
