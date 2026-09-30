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

/** index 의 공연이 delta 칸 옆 이웃과 자리를 바꿀 수 있는지. 묶음 경계를 넘으면 학생 앱에서 순서가 안 바뀐다 */
export function canSwapWithinGroup(list: Performance[], index: number, delta: number): boolean {
  const swap = index + delta
  return swap >= 0 && swap < list.length && groupKeyOf(list[swap]) === groupKeyOf(list[index])
}

/**
 * 학생 앱 칸 순서대로 묶는다. 묶음 안은 받은 순서를 그대로 지킨다 — 넘기는 쪽이 seq 순으로
 * 정렬해 두면 묶음 안도 seq 순이다.
 *
 * keepEmpty 면 학생 앱에 칸이 있는 세 묶음은 비어도 남긴다. 공연이 없어도 칸 순서가
 * 보여야 해서다. "기타" 는 칸이 없는 묶음이라 공연이 있을 때만 둔다.
 */
export function groupByScheduleType(
  performances: Performance[],
  { keepEmpty = false }: { keepEmpty?: boolean } = {},
): PerformanceGroup[] {
  const groups: PerformanceGroup[] = SCHEDULE_TYPE_SLOTS.map(({ type, time }) => ({
    type,
    time,
    performances: performances.filter((p) => p.type === type),
  })).filter((group) => keepEmpty || group.performances.length > 0)
  const other = performances.filter((p) => groupKeyOf(p) === null)
  if (other.length > 0) groups.push({ type: null, time: null, performances: other })
  return groups
}
