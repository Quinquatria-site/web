import { FESTIVAL_DAYS } from './festival-days'
import { at } from './seoul-time'
import { TIMELINE_SLOTS } from './timeline-slots'

/** 배너가 고르는 축제 시점. 전 · 여는 중 · 밤사이 쉼 · 끝 */
export type FestivalPhase = 'before' | 'open' | 'break' | 'after'

/** 축제 날마다 [여는 시각, 닫는 시각] ms. 타임라인 첫 칸(팔찌 배부)에 열고 마지막 칸(하루 종료)에 닫는다 */
export const FESTIVAL_HOURS: [number, number][] = FESTIVAL_DAYS.map(({ date }) => [
  at(date, TIMELINE_SLOTS[0].time),
  at(date, TIMELINE_SLOTS[TIMELINE_SLOTS.length - 1].time),
])

/** 그 순간의 축제 시점 */
export function phaseAt(now: number): FestivalPhase {
  if (now < FESTIVAL_HOURS[0][0]) return 'before'
  if (now >= FESTIVAL_HOURS[FESTIVAL_HOURS.length - 1][1]) return 'after'
  return FESTIVAL_HOURS.some(([open, close]) => now >= open && now < close) ? 'open' : 'break'
}

// 개발 서버에서만 ?now=2026-10-07T23:30(서울 시각)으로 지금을 바꿔 조건별 배너를 본다
const NOW_OVERRIDE = process.env.NODE_ENV === 'development'

/** 지금 시각(ms). 개발 서버에서는 ?now= 를 먼저 본다 */
export function currentTime(): number {
  if (NOW_OVERRIDE) {
    const q = new URLSearchParams(location.search).get('now')
    const t = q ? Date.parse(`${q}+09:00`) : NaN
    if (!Number.isNaN(t)) return t
  }
  return Date.now()
}

const NOW_EXPR = NOW_OVERRIDE
  ? '(function(){var q=new URLSearchParams(location.search).get("now"),t=q?Date.parse(q+"+09:00"):NaN;return isNaN(t)?Date.now():t})()'
  : 'Date.now()'

/** 그리기 전에 돌아 elementId 의 data-phase 를 맞추는 인라인 스크립트. React 밖이라 phaseAt·currentTime 을 문자열로 한 번 더 적는다 */
export function phaseScript(elementId: string): string {
  return `{var e=document.getElementById(${JSON.stringify(elementId)});if(e){var n=${NOW_EXPR},h=${JSON.stringify(FESTIVAL_HOURS)};e.setAttribute("data-phase",n<h[0][0]?"before":n>=h[h.length-1][1]?"after":h.some(function(d){return n>=d[0]&&n<d[1]})?"open":"break")}}`
}
