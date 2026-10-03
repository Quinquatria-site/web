import type { Page } from '@quen/schema/common/page'
import { CACHE_TAGS } from '@/shared/api/cache-tags'
import { serverApi } from '@/shared/api/server-api'
import { listWithSource, oneWithSource } from '@/shared/api/source-fallback'
import type { Notice } from './notice'

const list = (path: string) =>
  listWithSource((source) =>
    serverApi<Page<Notice>>(path, {
      tags: [CACHE_TAGS.notices],
      query: { size: '100' },
      source,
    }).then((page) => page.items),
  )

/** 페이지 언어의 공지 전체, 번역이 없는 공지는 한국어로. 상단 고정을 앞에, 일반을 뒤에 두고 각각은 API 가 준 최신순을 따른다 */
export async function getNotices(): Promise<Notice[]> {
  // Customer API 는 종류마다 경로가 달라 두 목록을 함께 받아 잇는다. 각각 명세 최대치 100건을 한 번에 받는다
  const [permanent, general] = await Promise.all([list('/notices/permanent'), list('/notices')])
  return [...permanent, ...general]
}

/** 페이지 언어의 공지 한 건, 번역이 없으면 한국어로. 없는 id 면 null 이고, 목록과 같은 notices 태그로 재검증된다 */
export function getNotice(id: number): Promise<Notice | null> {
  return oneWithSource((source) =>
    serverApi<Notice>(`/notices/${id}`, { tags: [CACHE_TAGS.notices], source }),
  )
}
