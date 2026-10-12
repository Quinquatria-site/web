import type { Page } from '@quen/schema/common/page'
import { CACHE_TAGS } from '@/shared/api/cache-tags'
import { serverApi } from '@/shared/api/server-api'
import { listWithSource, oneWithSource } from '@/shared/api/source-fallback'
import type { LostItem } from './lost-item'

/** 페이지 언어의 분실물 전체, 번역이 없는 건 한국어로. 백엔드를 내리기 전에 떠 둔 응답이라 운영을 마친 시점에서 멈춰 있다 */
export function getLostItems(): Promise<LostItem[]> {
  return listWithSource((source) =>
    serverApi<Page<LostItem>>('/lost-items', {
      tags: [CACHE_TAGS.lostItems],
      query: { size: '100' },
      source,
    }).then((page) => page.items),
  )
}

/** 페이지 언어의 분실물 한 건, 번역이 없으면 한국어로. 떠 둔 목록에 없는 id 면 null 이라 상세는 404 로 간다 */
export function getLostItem(id: number): Promise<LostItem | null> {
  return oneWithSource((source) =>
    serverApi<LostItem>(`/lost-items/${id}`, { tags: [CACHE_TAGS.lostItems], source }),
  )
}
