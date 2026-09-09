import type { Lang } from './i18n'

export const PAGE_PATHS = ['/timeline', '/map', '/notice', '/lost-found'] as const

export type PagePath = (typeof PAGE_PATHS)[number]

/** 모든 링크는 언어 세그먼트를 앞에 달고 나간다. */
export function langHref<P extends PagePath | ''>(lang: Lang, path: P = '' as P) {
  return `/${lang}${path}` as const
}

/** 상세는 목록 아래에 붙는다. */
export function noticeHref(lang: Lang, id: string) {
  return `${langHref(lang, '/notice')}/${id}` as const
}

/**
 * 상세 화면에서는 dock 이 한 알로 접히고 돌아갈 곳 하나만 남는다.
 * 어느 경로가 상세인지 여기서 정한다. 링크로 바로 들어와도 목록으로 나간다.
 */
export function backHref(lang: Lang, pathname: string) {
  const notice = langHref(lang, '/notice')
  return pathname.startsWith(`${notice}/`) ? notice : null
}
