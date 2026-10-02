import type { PerformanceType } from '@quen/schema/entities/performance'
import type { Messages } from '@/shared/i18n/messages'

/** 타임라인 뼈대 한 칸. 고정 문구 키이거나, 그 종류의 공연을 seq 순으로 펼칠 자리 */
export type TimelineSlot =
  | { time: string; text: keyof Messages['schedule']['slots'] }
  | { time: string; performances: PerformanceType }

/** 하루 타임라인 뼈대. 문구·시각은 바뀌지 않아 여기 두고, 공연 칸만 데이터로 채운다 */
export const TIMELINE_SLOTS: TimelineSlot[] = [
  { time: '11:00', text: 'wristbands' },
  { time: '13:00', text: 'boothsOpen' },
  { time: '15:00', text: 'studentEntry' },
  { time: '15:10', performances: 'STUDENT' },
  { time: '18:00', performances: 'SPECIAL' },
  { time: '19:00', text: 'visitorEntry' },
  { time: '19:10', performances: 'ARTIST' },
  { time: '23:00', text: 'dayEnd' },
]
