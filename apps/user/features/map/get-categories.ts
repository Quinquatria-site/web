import type { Page } from '@quen/schema/common/page'
import { CACHE_TAGS } from '@/shared/api/cache-tags'
import { serverApi } from '@/shared/api/server-api'
import type { Category } from './category'

/** 페이지 언어의 장소 카테고리 전체. API 순서(주점→부스→…)를 그대로 쓰고, categories 태그로 재검증된다 */
export async function getCategories(): Promise<Category[]> {
  const page = await serverApi<Page<Category>>('/categories', {
    tags: [CACHE_TAGS.categories],
    query: { size: '100' },
  })
  return page.items
}
