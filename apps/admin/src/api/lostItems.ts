import type { LanguageCode } from '@quen/schema/common/language'
import { toKstIso } from '../lib/kst'
import type { LostItem } from '../types'
import { request } from './client'
import { BACKOFFICE_BASE } from './config'
import { listAll } from './list'

/**
 * 분실물 (§5.8) 요청 본문.
 *
 * 공지와 같다 — 응답 번역의 `id`·`lost_item_id` 를 요청에 넣으면 422 다
 * (`extra="forbid"`). 서버는 title 만 필수이고 description·found_location 은
 * 선택이다. 습득 장소를 KO 필수로 막는 것은 화면 규칙이다.
 */
export interface LostItemTextWrite {
  language_code: LanguageCode
  title: string
  description: string
  found_location: string
}

export interface LostItemWrite {
  /** 업로드가 돌려준 S3 key. 필드 이름만 url 이다 */
  image_url: string | null
  /** POST 필수. 생성이면 언제나 false 다 */
  is_returned: boolean
  translations: LostItemTextWrite[]
}

/** PATCH 는 전부 선택. 보낸 언어만 upsert 하고 안 보낸 언어는 그대로 둔다 (§5.2) */
export type LostItemPatch = Partial<LostItemWrite>

/** 캐시에 넣기 전 한 번 거친다. created_at 을 KST 로 — lib/kst.ts 참고 */
function toLostItem(raw: LostItem): LostItem {
  return { ...raw, created_at: toKstIso(raw.created_at) }
}

export async function fetchLostItems(): Promise<LostItem[]> {
  return (await listAll<LostItem>('/lost-items')).map(toLostItem)
}

export async function createLostItem(body: LostItemWrite): Promise<LostItem> {
  return toLostItem(
    await request<LostItem>(BACKOFFICE_BASE, '/lost-items', { method: 'POST', body }),
  )
}

export async function updateLostItem(id: number, body: LostItemPatch): Promise<LostItem> {
  return toLostItem(
    await request<LostItem>(BACKOFFICE_BASE, `/lost-items/${id}`, { method: 'PATCH', body }),
  )
}

export async function deleteLostItem(id: number): Promise<void> {
  await request<void>(BACKOFFICE_BASE, `/lost-items/${id}`, { method: 'DELETE' })
}

/** 번역을 지우는 유일한 수단. PATCH 로는 못 지운다. KO 는 409 */
export async function deleteLostItemTranslation(id: number, language: LanguageCode): Promise<void> {
  await request<void>(BACKOFFICE_BASE, `/lost-items/${id}/translations/${language}`, {
    method: 'DELETE',
  })
}
