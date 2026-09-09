import type { Lang } from './i18n'

export const PAGE_PATHS = ['/timeline', '/map', '/notice', '/lost-found'] as const

export type PagePath = (typeof PAGE_PATHS)[number]

/** 모든 링크는 언어 세그먼트를 앞에 달고 나간다. */
export function langHref<P extends PagePath | ''>(lang: Lang, path: P = '' as P) {
  return `/${lang}${path}` as const
}
