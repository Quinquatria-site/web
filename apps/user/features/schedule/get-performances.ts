import type { LanguageCode } from '@quen/schema/common/language'
import type { Page } from '@quen/schema/common/page'
import { CACHE_TAGS } from '@/shared/api/cache-tags'
import { serverApi } from '@/shared/api/server-api'
import type { Performance } from './performance'

/** 공연 전체. 명세 최대치 100건을 한 번에 받고, 백오피스가 바꾸면 performances 태그로 재검증된다 */
export async function getPerformances(language: LanguageCode): Promise<Performance[]> {
  const page = await serverApi<Page<Performance>>('/performances', {
    language,
    tags: [CACHE_TAGS.performances],
    query: { size: '100' },
  })
  return page.items
}
