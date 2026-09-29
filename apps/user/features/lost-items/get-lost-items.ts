import type { Page } from '@quen/schema/common/page'
import { CACHE_TAGS } from '@/shared/api/cache-tags'
import { serverApi } from '@/shared/api/server-api'
import type { LostItem } from './lost-item'

/** 페이지 언어의 분실물 전체. 명세 최대치 100건을 한 번에 받고, 백오피스가 바꾸면 lost-items 태그로 재검증된다 */
export async function getLostItems(): Promise<LostItem[]> {
  const page = await serverApi<Page<LostItem>>('/lost-items', {
    tags: [CACHE_TAGS.lostItems],
    query: { size: '100' },
  })
  return page.items
}

/** 페이지 언어의 분실물 한 건. 목록과 같은 lost-items 태그로 재검증된다 */
export async function getLostItem(id: number): Promise<LostItem> {
  return serverApi<LostItem>(`/lost-items/${id}`, { tags: [CACHE_TAGS.lostItems] })
}
