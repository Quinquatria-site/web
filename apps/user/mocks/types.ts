import type { Lang } from '@/libs/i18n'

/** 'YYYY-MM-DD' */
export type IsoDate = string

/** 'HH:MM', 24시간 */
export type ClockTime = string

/** 언어마다 다른 문구. Django 가 언어별로 내려줄 자리다. */
export type Localized = Record<Lang, string>

/** 공연 둘은 카드로, 그 외 일정은 선 위의 한 줄로 놓인다. */
export type EventKind = 'student' | 'celeb' | 'etc'

export type FestivalEvent = {
  id: string
  date: IsoDate
  kind: EventKind
  start: ClockTime
  /** 한순간에 지나가는 일정은 비운다. 이 값이 있어야 진행 중 판정이 선다. */
  end?: ClockTime
  name: Localized
  /** 공연에만 있다. */
  place?: Localized
  intro?: Localized
  image?: string
}

export type FestivalDay = {
  date: IsoDate
  label: string
}
