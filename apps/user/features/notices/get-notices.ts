import type { Page } from '@quen/schema/common/page'
import { CACHE_TAGS } from '@/shared/api/cache-tags'
import { ApiError, serverApi } from '@/shared/api/server-api'
import type { Notice } from './notice'

const list = (path: string) =>
  serverApi<Page<Notice>>(path, { tags: [CACHE_TAGS.notices], query: { size: '100' } })

/** 페이지 언어의 공지 전체. 상단 고정을 앞에, 일반을 뒤에 두고 각각은 API 가 준 최신순을 따른다 */
export async function getNotices(): Promise<Notice[]> {
  // Customer API 는 종류마다 경로가 달라 두 목록을 함께 받아 잇는다. 각각 명세 최대치 100건을 한 번에 받는다
  const [permanent, general] = await Promise.all([list('/notices/permanent'), list('/notices')])
  return [...permanent.items, ...general.items]
}

/** 페이지 언어의 공지 한 건. 없는 id 면 null 이고, 목록과 같은 notices 태그로 재검증된다 */
export async function getNotice(id: number): Promise<Notice | null> {
  try {
    return await serverApi<Notice>(`/notices/${id}`, { tags: [CACHE_TAGS.notices] })
  } catch (error) {
    // 지워졌거나 주소를 잘못 친 id 는 404 화면으로 보내고, 그 밖의 실패는 그대로 던진다
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}
