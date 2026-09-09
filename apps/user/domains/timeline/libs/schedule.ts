import { EVENTS, NOW } from '@/mocks/timeline'
import type { ClockTime, FestivalEvent, IsoDate } from '@/mocks/types'

/** 판정에 쓰는 한 시점. 목 데이터의 NOW 가 이 모양이다. */
export type Moment = { date: IsoDate; time: ClockTime }

/** 배너가 걸치는 네 가지 상태. 문구도 이 이름으로 찾는다. */
export type Phase = 'live' | 'open' | 'before' | 'closed'

const stamp = (event: FestivalEvent) => `${event.date} ${event.start}`
const at = (moment: Moment) => `${moment.date} ${moment.time}`

export function eventsOn(date: IsoDate) {
  return EVENTS.filter((event) => event.date === date)
}

export function isAct(event: FestivalEvent) {
  return event.kind !== 'etc'
}

/** 지금 무대에 올라 있는 공연. 끝 시각이 없는 일정은 후보가 아니다. */
export function liveEvent(moment: Moment = NOW): FestivalEvent | null {
  return (
    EVENTS.find(
      (event) =>
        event.date === moment.date &&
        event.end !== undefined &&
        isAct(event) &&
        event.start <= moment.time &&
        moment.time < event.end,
    ) ?? null
  )
}

/** 아직 오지 않은 첫 일정. */
function nextEvent(moment: Moment): FestivalEvent | null {
  return EVENTS.find((event) => stamp(event) > at(moment)) ?? null
}

export function festivalPhase(moment: Moment = NOW): Phase {
  if (liveEvent(moment)) return 'live'

  const today = eventsOn(moment.date)
  const first = today[0]
  const last = today[today.length - 1]
  // 그날 첫 일정과 마지막 일정 사이면 공연이 없어도 부스는 열려 있다
  if (first && last && first.start <= moment.time && moment.time <= last.start) return 'open'

  return nextEvent(moment) ? 'before' : 'closed'
}

/** 배너를 눌렀을 때 찾아갈 자리. 진행 중인 공연 → 다음 일정 → 마지막 일정 순. */
export function focusEvent(moment: Moment = NOW): FestivalEvent {
  return liveEvent(moment) ?? nextEvent(moment) ?? EVENTS[EVENTS.length - 1]
}

export function timeRange(event: FestivalEvent) {
  return event.end ? `${event.start} – ${event.end}` : event.start
}
