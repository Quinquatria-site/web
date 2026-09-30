import type { Performance, PerformanceType } from '../mocks/types'

/**
 * 학생 앱 일정표의 공연 칸 순서와 시각. 학생 앱은 공연을 종류별 고정 칸에 넣어 보여주므로
 * seq 는 같은 종류 안에서만 순서가 된다. 두 앱은 따로 빌드돼 같은 값을 여기에 한 번 더 둔다 —
 * apps/user/features/schedule/timeline-slots.ts 의 TIMELINE_SLOTS 를 바꾸면 여기도 같이 바꾼다.
 */
export const SCHEDULE_TYPE_SLOTS = [
  { type: 'STUDENT', time: '15:10' },
  { type: 'SPECIAL', time: '18:00' },
  { type: 'ARTIST', time: '19:10' },
] as const satisfies readonly { type: PerformanceType; time: string }[]

/** 한 종류의 공연 묶음. 모르는 종류는 type·time 이 null 인 "기타" 묶음에 모인다 */
export interface PerformanceGroup {
  type: PerformanceType | null
  time: string | null
  performances: Performance[]
}

/** 공연이 들어갈 묶음의 열쇠. 학생 앱에 칸이 없는 종류는 모두 null("기타") */
export function groupKeyOf(performance: Performance): PerformanceType | null {
  return SCHEDULE_TYPE_SLOTS.some(({ type }) => type === performance.type) ? performance.type : null
}

/**
 * 학생 앱 칸 순서대로 묶는다. 묶음 안은 받은 순서를 그대로 지킨다 — 넘기는 쪽이 seq 순으로
 * 정렬해 두면 묶음 안도 seq 순이다. 빈 묶음은 뺀다.
 */
export function groupByScheduleType(performances: Performance[]): PerformanceGroup[] {
  const groups: PerformanceGroup[] = SCHEDULE_TYPE_SLOTS.map(({ type, time }) => ({
    type,
    time,
    performances: performances.filter((p) => p.type === type),
  }))
  groups.push({
    type: null,
    time: null,
    performances: performances.filter((p) => groupKeyOf(p) === null),
  })
  return groups.filter((group) => group.performances.length > 0)
}
