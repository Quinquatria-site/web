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

// 분실물만 백엔드에서 받던 구현. 기록으로 남겨 둔다
// import type { Page } from '@quen/schema/common/page'
// import { CACHE_TAGS } from '@/shared/api/cache-tags'
// import { liveApi } from '@/shared/api/server-api'
// import { listWithSource, oneWithSource } from '@/shared/api/source-fallback'
// import { remoteAssetUrl } from '@/shared/photo/asset-url'
// import type { LostItem } from './lost-item'
//
// // 사진 key 를 버킷 주소로 바꿔 둬야 Photo 가 public/images 에서 찾지 않는다
// const withRemoteImage = (item: LostItem): LostItem => ({
//   ...item,
//   image_url: item.image_url && remoteAssetUrl(item.image_url),
// })
//
// /** 페이지 언어의 분실물 전체, 번역이 없는 건 한국어로. 축제 뒤에도 운영해 백엔드에서 받고, 백오피스가 바꾸면 lost-items 태그로 재검증된다 */
// export async function getLostItems(): Promise<LostItem[]> {
//   const items = await listWithSource((source) =>
//     liveApi<Page<LostItem>>('/lost-items', {
//       tags: [CACHE_TAGS.lostItems],
//       query: { size: '100' },
//       source,
//     }).then((page) => page.items),
//   )
//   return items.map(withRemoteImage)
// }
//
// /** 페이지 언어의 분실물 한 건, 번역이 없으면 한국어로. 없는 id 면 null 이고, 목록과 같은 lost-items 태그로 재검증된다 */
// export async function getLostItem(id: number): Promise<LostItem | null> {
//   const item = await oneWithSource((source) =>
//     liveApi<LostItem>(`/lost-items/${id}`, { tags: [CACHE_TAGS.lostItems], source }),
//   )
//   return item && withRemoteImage(item)
// }
