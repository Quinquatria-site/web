import type { PerformanceType } from '@quen/schema/entities/performance'

/** 타임라인 뼈대 한 칸. 고정 문구이거나, 그 종류의 공연을 seq 순으로 펼칠 자리 */
export type TimelineSlot =
  { time: string; text: string } | { time: string; performances: PerformanceType }

/** 하루 타임라인 뼈대. 문구·시각은 바뀌지 않아 여기 두고, 공연 칸만 데이터로 채운다 */
export const TIMELINE_SLOTS: TimelineSlot[] = [
  { time: '11:00', text: '외대인 입장팔찌 배부 시작' },
  { time: '13:00', text: '전체 부스 오픈' },
  { time: '15:00', text: '외대인 관객 운동장 입장 시작' },
  { time: '15:10', performances: 'STUDENT' },
  { time: '18:00', performances: 'SPECIAL' },
  { time: '19:00', text: '외부인 관객 운동장 입장 시작' },
  { time: '19:10', performances: 'ARTIST' },
  { time: '23:00', text: '축제 첫째날 종료' },
]
