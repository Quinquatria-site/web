import { NOTICES } from '@/mocks/notices'
import type { IsoDate } from '@/mocks/types'

/** 스크롤해도 남는 것과 흘러 지나가는 것. 목록은 이 둘을 이어 붙인다. */
export const PINNED_NOTICES = NOTICES.filter((notice) => notice.kind === 'pinned')
export const NORMAL_NOTICES = NOTICES.filter((notice) => notice.kind === 'normal')

export function noticeById(id: string) {
  return NOTICES.find((notice) => notice.id === id) ?? null
}

/** '2026-09-28' → '2026.09.28'. 숫자는 언어를 타지 않는다. */
export function noticeDate(date: IsoDate) {
  return date.replaceAll('-', '.')
}
