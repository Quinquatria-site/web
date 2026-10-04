import type { PerformanceType } from '@quen/schema/entities/performance'
import type { Messages } from '@/shared/i18n/messages'

/** 타임라인 뼈대 한 칸. 고정 문구 키이거나, 그 종류의 공연을 seq 순으로 펼칠 자리. 공연 칸 time 이 null 이면 시각 대신 종류 이름 줄을 위에 둔다 */
export type TimelineSlot =
  | { time: string; text: keyof Messages['schedule']['slots'] }
  | { time: string | null; performances: PerformanceType }

/** 하루 타임라인 뼈대. 문구·시각은 바뀌지 않아 여기 두고, 공연 칸만 데이터로 채운다 */
export const TIMELINE_SLOTS: TimelineSlot[] = [
  { time: '17:00', performances: 'STUDENT' },
  { time: '19:30', performances: 'SPECIAL' },
  // 아티스트는 시작 시각을 공개하지 않는다
  { time: null, performances: 'ARTIST' },
  { time: '23:00', text: 'dayEnd' },
]
