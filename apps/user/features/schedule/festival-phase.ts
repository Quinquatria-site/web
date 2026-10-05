import { FESTIVAL_DAYS } from './festival-days'
import { at } from './seoul-time'

type FestivalPhase = 'before' | 'open' | 'break' | 'after'

// 공연 시각과 따로 간다. 타임라인 칸 시각이 바뀌어도 배너 시각은 그대로다
const OPEN_TIME = '11:00'
const CLOSE_TIME = '23:00'

// 축제 날마다 [여는 시각, 닫는 시각] ms
const FESTIVAL_HOURS: [number, number][] = FESTIVAL_DAYS.map(({ date }) => [
  at(date, OPEN_TIME),
  at(date, CLOSE_TIME),
])

/** 그 순간의 축제 시점. 전 · 여는 중 · 밤사이 쉼 · 끝 */
export function phaseAt(now: number): FestivalPhase {
  if (now < FESTIVAL_HOURS[0][0]) return 'before'
  if (now >= FESTIVAL_HOURS[FESTIVAL_HOURS.length - 1][1]) return 'after'
  return FESTIVAL_HOURS.some(([open, close]) => now >= open && now < close) ? 'open' : 'break'
}

/** 페이지를 굽는 지금 시각(ms). 개발 서버에서는 NOW=2026-10-07T23:30(서울 시각)으로 바꿔 조건별 배너를 본다 */
export function bakeTime(): number {
  const override = process.env.NODE_ENV === 'development' ? process.env.NOW : undefined
  const t = override ? Date.parse(`${override}+09:00`) : NaN
  return Number.isNaN(t) ? Date.now() : t
}
