'use client'

import { useEffect, useState } from 'react'
import { SCHEDULE_PANEL_ID, dayTabId } from './DayTabs'
import type { Performance } from './performance'
import { PerformanceCard } from './PerformanceCard'
import { TIMELINE_SLOTS } from './timeline-slots'

type Row =
  | { key: string; time: string | null; active: boolean; text: string }
  | { key: string; time: string | null; active: boolean; performance: Performance }

// 서울 기준 그날 그 시각. 기기 시간대와 상관없이 같은 순간을 가리킨다
const at = (date: string, time: string) => new Date(`${date}T${time}:00+09:00`).getTime()

// 서버에서 그린 화면과 어긋나지 않게 첫 렌더에는 비워 두고, 붙은 뒤 1분마다 다시 잰다
function useNow() {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    const tick = () => setNow(Date.now())
    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])
  return now
}

// 문구 칸은 다음 칸 시각 전까지 진행 중이고, 공연은 서버의 is_live 를 따른다. 공연이 없는 종류는 숨긴다
function toRows(date: string, performances: Performance[], now: number | null): Row[] {
  return TIMELINE_SLOTS.flatMap((slot, i): Row[] => {
    if ('text' in slot) {
      const next = TIMELINE_SLOTS[i + 1]
      const active =
        now !== null &&
        next !== undefined &&
        now >= at(date, slot.time) &&
        now < at(date, next.time)
      return [{ key: slot.time, time: slot.time, active, text: slot.text }]
    }
    return performances
      .filter((p) => p.type === slot.performances)
      .map((p, j) => ({
        key: `p${p.id}`,
        time: j === 0 ? slot.time : null,
        active: p.is_live,
        performance: p,
      }))
  })
}

// 타임라인 점. 진행 중이면 노을빛으로 번지고 파동이 퍼진다
function TimelineDot({ active }: { active: boolean }) {
  return (
    <span className="relative size-2">
      {active && (
        <span className="absolute inset-0 animate-dot-ping rounded-full bg-(--sunlight) opacity-70 motion-reduce:animate-none" />
      )}
      <span
        className={`absolute inset-0 rounded-full bg-secondary ${active ? 'shadow-[0_0_4px_3px_var(--sunlight)]' : ''}`}
      />
    </span>
  )
}

/** 고른 날의 타임라인. 고정 문구 사이에 종류별 공연을 seq 순으로 끼워 넣고, 지금 진행 중인 줄의 점을 반짝인다 */
export function Timeline({
  day,
  date,
  performances,
}: {
  day: number
  date: string
  performances: Performance[]
}) {
  const rows = toRows(date, performances, useNow())
  return (
    <ol
      id={SCHEDULE_PANEL_ID}
      role="tabpanel"
      aria-labelledby={dayTabId(day)}
      className="flex flex-col gap-[3px] text-secondary"
    >
      {rows.map((row, i) => (
        <li key={row.key} className="grid h-10 grid-cols-[40px_35px_1fr] items-center">
          <span className="pl-0.5 text-xs leading-[normal]">{row.time}</span>
          <span className="relative flex h-full items-center justify-center">
            <TimelineDot active={row.active} />
            {/* 점 아래 4px 을 띄우고 다음 줄 점 위 4px 까지 잇는다 */}
            {i < rows.length - 1 && (
              <span className="absolute top-[calc(50%+8px)] h-[27px] w-px bg-border-strong" />
            )}
          </span>
          {'text' in row ? (
            <span className="truncate pl-1.5 text-base leading-[normal]">{row.text}</span>
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
