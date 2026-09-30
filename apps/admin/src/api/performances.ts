import type { LanguageCode } from '@quen/schema/common/language'
import type { PerformanceType } from '@quen/schema/entities/performance'
import type { Performance } from '../mocks/types'
import { request } from './client'
import { BACKOFFICE_BASE } from './config'
import { listAll } from './list'

/**
 * 공연 (§5.6) 요청.
 *
 * 요청 본문의 번역에는 응답에 붙는 `id`·`performance_id` 를 싣지 않는다 — 서버가 모르는
 * 필드는 422 다(`extra="forbid"`). `seq`·`is_live` 도 본문에 없다. 둘 다 서버가 정하거나
 * 전용 엔드포인트(live·reorder)로만 바뀐다.
 *
 * `date` 는 시각이 아니라 `YYYY-MM-DD` 라 공지·장소와 달리 KST 로 바꿀 것이 없다.
 */

export interface PerformanceTextWrite {
  language_code: LanguageCode
  title: string
  description: string
}

export interface PerformanceWrite {
  type: PerformanceType
  image_uri: string | null
  date: string
  translations: PerformanceTextWrite[]
}

export async function fetchPerformances(): Promise<Performance[]> {
  return listAll<Performance>('/performances')
}

/** 그 일차의 맨 뒤에 붙고 is_live=false 로 시작한다 */
export async function createPerformance(body: PerformanceWrite): Promise<Performance> {
  return request<Performance>(BACKOFFICE_BASE, '/performances', { method: 'POST', body })
}

/**
 * 보낸 언어만 upsert, 안 보낸 언어는 유지 (§5.2). date 가 바뀌면 옮긴 일차의 맨 뒤로
 * 가고 원래 일차는 서버가 1부터 다시 매긴다.
 */
export async function updatePerformance(
  id: number,
  body: Partial<PerformanceWrite>,
): Promise<Performance> {
  return request<Performance>(BACKOFFICE_BASE, `/performances/${id}`, { method: 'PATCH', body })
}

/** 영구 삭제 (§6). 그 일차는 서버가 다시 매긴다 */
export async function deletePerformance(id: number): Promise<void> {
  await request<void>(BACKOFFICE_BASE, `/performances/${id}`, { method: 'DELETE' })
}

/** 번역을 지우는 유일한 수단. PATCH 로는 못 지운다. KO 는 409 */
export async function deletePerformanceTranslation(
  id: number,
  language: LanguageCode,
): Promise<void> {
  await request<void>(BACKOFFICE_BASE, `/performances/${id}/translations/${language}`, {
    method: 'DELETE',
  })
}

/**
 * true 면 서버가 기존 live 를 내리고 이 공연만 올린다. 응답은 대상 한 건뿐이라
 * 내려간 공연은 호출부가 캐시에서 직접 내려야 한다.
 */
export async function putPerformanceLive(id: number, isLive: boolean): Promise<Performance> {
  return request<Performance>(BACKOFFICE_BASE, `/performances/${id}/live`, {
    method: 'PUT',
    body: { is_live: isLive },
  })
}

/**
 * order 위치가 곧 seq 다. 그 일차의 공연 ID 를 빠짐없이·중복 없이 담지 않으면 422 —
 * 다른 운영자가 그 사이에 추가·삭제한 것을 이 검사가 잡는다. 204 라 본문이 없다.
 */
export async function putPerformanceOrder(date: string, order: number[]): Promise<void> {
  await request<void>(BACKOFFICE_BASE, '/performances/reorder', {
    method: 'PUT',
    body: { date, order },
  })
}
