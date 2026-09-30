import type { Page } from '@quen/schema/common/page'
import { request } from './client'
import { BACKOFFICE_BASE } from './config'

/** 서버가 허용하는 최대. 이 이상은 422 다 */
const PAGE_SIZE = 100

/**
 * Backoffice 목록을 끝까지 받아 한 배열로 돌려준다.
 *
 * 화면이 전부를 메모리에 두고 읽는다 — 목록 정렬·필터, 홈 합계, 지도 마커가 모두
 * 전체를 가정한다. 축제 규모(공지 수십, 장소 72곳)라 페이지 한두 번이면 끝난다.
 *
 * `query` 는 목록 필터(`type` 등). page·size 는 여기서 붙인다.
 */
export async function listAll<T>(path: string, query: Record<string, string> = {}): Promise<T[]> {
  const items: T[] = []
  for (let page = 1; ; page += 1) {
    const params = new URLSearchParams({ ...query, page: String(page), size: String(PAGE_SIZE) })
    const response = await request<Page<T>>(BACKOFFICE_BASE, `${path}?${params}`)
    items.push(...response.items)
    // 빈 페이지에서도 멈춘다 — 받는 사이 누가 지워 total 이 줄면 영영 못 채운다
    if (items.length >= response.total || response.items.length === 0) return items
  }
}
