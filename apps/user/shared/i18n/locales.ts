import type { LanguageCode } from '@quen/schema/common/language'

/** 주소 첫 칸에 오는 언어. 배열 순서가 언어 선택 버튼 순서 */
export const LOCALES = ['ko', 'en', 'zh'] as const
export type Locale = (typeof LOCALES)[number]

/** 언어 없이 들어온 `/` 가 보내지는 언어 */
export const DEFAULT_LOCALE: Locale = 'ko'

/** 백오피스가 처음 쓰는 언어. 다른 언어 번역이 없으면 이 언어로 보여 준다 */
export const SOURCE_LOCALE: Locale = 'ko'

/** 주소 언어를 Customer API 의 language_code 로 옮긴다 */
export const API_LANGUAGE: Record<Locale, LanguageCode> = {
  ko: 'KO',
  en: 'EN',
  zh: 'CHN',
}

/** html lang 값. 중국어는 간체다 */
export const HTML_LANG: Record<Locale, string> = {
  ko: 'ko',
  en: 'en',
  zh: 'zh-Hans',
}

/** 받은 글의 html lang. 번역이 없어 한국어로 채운 글을 스크린리더·브라우저 번역이 한국어로 읽게 글 요소에 단다 */
export function contentLang(code: LanguageCode | null): string | undefined {
  const locale = LOCALES.find((value) => API_LANGUAGE[value] === code)
  return locale && HTML_LANG[locale]
}

/** 언어 선택 버튼에 그 언어 스스로의 이름으로 적는다 */
export const LOCALE_NAMES: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  zh: '中文',
}

/** 주소 칸 값이 지원하는 언어인지 */
export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}
