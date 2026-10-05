import type { Page } from '@quen/schema/common/page'
import { CACHE_TAGS } from '@/shared/api/cache-tags'
import { serverApi } from '@/shared/api/server-api'
import { listWithSource } from '@/shared/api/source-fallback'
import { imageAspect } from '@/shared/photo/image-aspect'
import type { ApiPerformance, Performance } from './performance'

/** 페이지 언어의 공연 전체, 번역이 없는 공연은 한국어로. 명세 최대치 100건을 한 번에 받고, 백오피스가 바꾸면 performances 태그로 재검증된다 */
export async function getPerformances(): Promise<Performance[]> {
  const performances = await listWithSource((source) =>
    serverApi<Page<ApiPerformance>>('/performances', {
      tags: [CACHE_TAGS.performances],
      query: { size: '100' },
      source,
    }).then((page) => page.items),
  )
  return Promise.all(
    performances.map(async (p) => ({
      ...p,
      image_aspect: p.image_uri ? await imageAspect(p.image_uri) : null,
    })),
  )
}
