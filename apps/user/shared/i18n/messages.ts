import type { Locale } from './locales'
import { en } from './messages/en'
import { ko } from './messages/ko'
import { zh } from './messages/zh'

/** 화면 문구 모양. 한국어 문구가 기준이라 다른 언어에 빠진 키가 있으면 타입 검사가 막는다 */
export type Messages = typeof ko

const MESSAGES: Record<Locale, Messages> = { ko, en, zh }

/** 그 언어의 화면 문구. 서버·브라우저 어디서든 쓴다 */
export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale]
}
