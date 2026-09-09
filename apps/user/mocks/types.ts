import type { Lang } from '@/libs/i18n'

/** 'YYYY-MM-DD' */
export type IsoDate = string

/** 'HH:MM', 24시간 */
export type ClockTime = string

/** 언어마다 다른 문구. Django 가 언어별로 내려줄 자리다. */
export type Localized = Record<Lang, string>

export type Artist = {
  id: string
  date: IsoDate
  start: ClockTime
  end: ClockTime
  name: Localized
  place: Localized
  intro: Localized
  image: string
}

export type FestivalDay = {
  date: IsoDate
  label: string
}
