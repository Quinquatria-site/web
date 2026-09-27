import type { Performance } from './performance'

/** 축제 이틀. 배열 순서가 곧 DAY 번호 */
export const FESTIVAL_DAYS = [
  { date: '2026-10-07', weekday: 'Wed' },
  { date: '2026-10-08', weekday: 'Thu' },
] as const

/** 공연을 축제 날짜별로 나누고 날마다 seq 순으로 정렬한다. 축제 날짜가 아닌 공연은 버린다 */
export function groupByFestivalDay(performances: Performance[]): Performance[][] {
  return FESTIVAL_DAYS.map(({ date }) =>
    performances.filter((p) => p.date === date).toSorted((a, b) => a.seq - b.seq),
  )
}
