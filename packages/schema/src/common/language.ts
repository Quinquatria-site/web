/** 서버가 지원하는 번역 언어 */
export const LANGUAGE_CODES = ['KO', 'EN', 'CHN'] as const
export type LanguageCode = (typeof LANGUAGE_CODES)[number]
