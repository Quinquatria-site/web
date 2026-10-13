import type { Page } from '@quen/schema/common/page'
import { CACHE_TAGS } from '@/shared/api/cache-tags'
import { liveApi } from '@/shared/api/server-api'
import { listWithSource, oneWithSource } from '@/shared/api/source-fallback'
import { remoteAssetUrl } from '@/shared/photo/asset-url'
import type { LostItem } from './lost-item'

// 사진 key 를 버킷 주소로 바꿔 둬야 Photo 가 public/images 에서 찾지 않는다
const withRemoteImage = (item: LostItem): LostItem => ({
  ...item,
  image_url: item.image_url && remoteAssetUrl(item.image_url),
})

/** 페이지 언어의 분실물 전체, 번역이 없는 건 한국어로. 축제 뒤에도 운영해 백엔드에서 받고, 백오피스가 바꾸면 lost-items 태그로 재검증된다 */
export async function getLostItems(): Promise<LostItem[]> {
  const items = await listWithSource((source) =>
    liveApi<Page<LostItem>>('/lost-items', {
      tags: [CACHE_TAGS.lostItems],
      query: { size: '100' },
      source,
    }).then((page) => page.items),
  )
  return items.map(withRemoteImage)
}

/** 페이지 언어의 분실물 한 건, 번역이 없으면 한국어로. 없는 id 면 null 이고, 목록과 같은 lost-items 태그로 재검증된다 */
export async function getLostItem(id: number): Promise<LostItem | null> {
  const item = await oneWithSource((source) =>
    liveApi<LostItem>(`/lost-items/${id}`, { tags: [CACHE_TAGS.lostItems], source }),
  )
  return item && withRemoteImage(item)
}
