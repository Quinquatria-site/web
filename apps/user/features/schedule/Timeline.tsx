import { getLocale } from '@/shared/i18n/get-locale'
import type { PerformanceType } from '@quen/schema/entities/performance'
import { getMessages } from '@/shared/i18n/messages'
import { ClockDot } from './ClockDot'
import type { Performance } from './performance'
import { PerformanceCard } from './PerformanceCard'
import { at } from './seoul-time'
import { TIMELINE_SLOTS, type TimelineSlot } from './timeline-slots'
import { TimelineDot } from './TimelineDot'

/** 타임라인 공연 줄의 id. 배너가 이 줄로 옮겨 갈 때 쓴다 */
export const performanceAnchorId = (id: number) => `performance-${id}`

type TextSlot = Extract<TimelineSlot, { text: string }>

type Row = { key: string; time: string | null } & (
  | { text: TextSlot['text']; start: number; end: number | null }
  | { label: PerformanceType; live: boolean }
  | { performance: Performance }
)

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
          end: next?.time ? at(date, next.time) : null,
        },
      ]
    }
    const group = performances.filter((p) => p.type === slot.performances)
    const cards: Row[] = group.map((p, j) => ({
      key: `p${p.id}`,
      time: j === 0 ? slot.time : null,
      performance: p,
    }))
    if (slot.time || group.length === 0) return cards
    // 시각을 공개하지 않는 칸은 종류 이름 줄로 대신 알리고, 그 종류가 공연 중이면 점을 켠다
    const label: Row = {
      key: `label-${slot.performances}`,
      time: null,
      label: slot.performances,
      live: group.some((p) => p.is_live),
    }
    return [label, ...cards]
  })
}

/** 하루 타임라인. 고정 문구 사이에 종류별 공연을 seq 순으로 끼워 넣고, 진행 중인 줄의 점을 반짝인다 */
export async function Timeline({
  day,
  date,
  performances,
}: {
  /** FESTIVAL_DAYS 의 자리. 날마다 다른 문구를 고른다 */
  day: number
  date: string
  performances: Performance[]
}) {
  const { slots, performanceTypes } = getMessages(await getLocale()).schedule
  const rows = toRows(date, performances)
  return (
    // --tl 은 360 화면 기준 1px. 좁은 폰에서는 화면 폭만큼 시각·칸·이름을 같이 줄인다
    <ol className="flex flex-col gap-[3px] text-text-inverse [--tl:min(1px,var(--app-width)/360)]">
      {rows.map((row, i) => (
        <li
          key={row.key}
          id={'performance' in row ? performanceAnchorId(row.performance.id) : undefined}
          className="grid h-10 scroll-mt-6 grid-cols-[calc(40*var(--tl))_calc(35*var(--tl))_1fr] items-center"
        >
          <span className="pl-0.5 text-[length:calc(12*var(--tl))] leading-[normal]">
            {row.time}
          </span>
          <span className="relative flex h-full items-center justify-center">
            {'text' in row ? (
              <ClockDot start={row.start} end={row.end} />
            ) : (
              <TimelineDot active={'label' in row ? row.live : row.performance.is_live} />
            )}
            {/* 점 아래 4px 을 띄우고 다음 줄 점 위 4px 까지 잇는다 */}
            {i < rows.length - 1 && (
              <span className="absolute top-[calc(50%+8px)] h-[27px] w-px bg-(--beige-yellow)" />
            )}
          </span>
          {'performance' in row ? (
            // min-w-0 이 없으면 1fr 칸이 긴 공연 이름 폭만큼 늘어나 말줄임 대신 화면 밖으로 밀린다
            <div className="min-w-0 pl-1">
              <PerformanceCard performance={row.performance} />
            </div>
          ) : (
            <span className="truncate pl-1.5 text-[length:calc(16*var(--tl))] leading-[normal]">
              {'text' in row ? slots[row.text][day] : performanceTypes[row.label]}
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}
