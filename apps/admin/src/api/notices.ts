import type { LanguageCode } from '@quen/schema/common/language'
import type { NoticeType } from '@quen/schema/entities/notice'
import { toKstIso } from '../lib/kst'
import type { Notice } from '../types'
import { request } from './client'
import { BACKOFFICE_BASE } from './config'
import { listAll } from './list'

/**
 * 공지 (§5.7) 요청 본문.
 *
 * 응답의 번역에는 `id`·`notice_id` 가 붙지만 요청에는 넣으면 안 된다 — 서버가
 * 모르는 필드를 받으면 422 다(`extra="forbid"`). 그래서 응답 타입을 재사용하지 않고
 * 따로 둔다. 요청 모양은 앱 몫이라 스키마 패키지가 아니라 여기 있다.
 */
export interface NoticeTextWrite {
  language_code: LanguageCode
  title: string
  content: string
  /** 이 언어의 사진. 빈 배열은 422 라 없으면 null. PATCH 에서 빼면 그 언어 사진을 그대로 둔다 */
  notice_image_uri?: string[] | null
}

export interface NoticeWrite {
  type: NoticeType
  translations: NoticeTextWrite[]
}

/** PATCH 는 전부 선택. 보낸 언어만 upsert 하고 안 보낸 언어는 그대로 둔다 (§5.2) */
export type NoticePatch = Partial<NoticeWrite>

/** 캐시에 넣기 전 한 번 거친다. created_at 을 KST 로 — lib/kst.ts 참고 */
function toNotice(raw: Notice): Notice {
  return { ...raw, created_at: toKstIso(raw.created_at) }
}

export async function fetchNotices(): Promise<Notice[]> {
  return (await listAll<Notice>('/notices')).map(toNotice)
}

export async function createNotice(body: NoticeWrite): Promise<Notice> {
  return toNotice(await request<Notice>(BACKOFFICE_BASE, '/notices', { method: 'POST', body }))
}

export async function updateNotice(id: number, body: NoticePatch): Promise<Notice> {
  return toNotice(
    await request<Notice>(BACKOFFICE_BASE, `/notices/${id}`, { method: 'PATCH', body }),
  )
}

export async function deleteNotice(id: number): Promise<void> {
  await request<void>(BACKOFFICE_BASE, `/notices/${id}`, { method: 'DELETE' })
}

/** 번역을 지우는 유일한 수단. PATCH 로는 못 지운다. KO 는 409 */
export async function deleteNoticeTranslation(id: number, language: LanguageCode): Promise<void> {
  await request<void>(BACKOFFICE_BASE, `/notices/${id}/translations/${language}`, {
    method: 'DELETE',
  })
}
