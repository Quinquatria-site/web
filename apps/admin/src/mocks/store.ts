import { useSyncExternalStore } from 'react'
import { isApiError } from '../api'
import {
  createNotice,
  deleteNotice as apiDeleteNotice,
  deleteNoticeTranslation as apiDeleteNoticeTranslation,
  fetchNotices,
  updateNotice,
  type NoticeWrite,
} from '../api/notices'
import {
  createCategory,
  createMenu,
  createPlace,
  deleteMenu as apiDeleteMenu,
  deleteMenuTranslation as apiDeleteMenuTranslation,
  deletePlace as apiDeletePlace,
  deletePlaceTranslation as apiDeletePlaceTranslation,
  fetchCategories,
  fetchMenus,
  fetchPlaces,
  updateMenu,
  updatePlace,
  type MenuTextWrite,
  type MenuWrite,
  type PlaceTextWrite,
  type PlaceWrite,
} from '../api/catalog'
import { CATEGORIES, CATEGORY_SEED } from './categories'
import { LOST_ITEMS } from './lostItems'
import { MENUS } from './menus'
import { NOTICES } from './notices'
import { PERFORMANCES } from './performances'
import { PLACES } from './places'
import type {
  Category,
  LanguageCode,
  LostItem,
  Menu,
  Notice,
  NoticeType,
  Performance,
  Place,
} from './types'

/**
 * 도메인 데이터의 한 자리. 화면은 여기서 동기로 읽는다.
 *
 * 도메인마다 실제 API 로 하나씩 옮기는 중이다. **공지·카테고리·장소·메뉴는 API 캐시**
 * (서버에서 받아 채우고 쓰기는 API 를 부른 뒤 반영), 나머지(공연·분실물)는 아직 목의 쓰기
 * 흉내다 — SPA 세션 동안만 유지되고 새로고침하면 초기 목으로 돌아간다.
 */

let nextId = 100000

export function draftId(): number {
  nextId += 1
  return nextId
}

/**
 * 목 배열은 모듈 전역이라 바꿔도 React 가 모른다. 쓰기마다 버전을 올려
 * useStoreVersion 을 구독한 화면만 다시 그린다. 실제 API 에서는 이 자리가
 * 쿼리 캐시 무효화가 된다.
 */
let version = 0
const listeners = new Set<() => void>()

function emit(): void {
  version += 1
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** 목 데이터가 바뀔 때마다 값이 달라진다. 목록·지도가 이걸 읽어 다시 그린다 */
export function useStoreVersion(): number {
  return useSyncExternalStore(subscribe, () => version)
}

/**
 * 카테고리·장소·메뉴는 API 캐시다 (공지와 같은 틀). DataGate 가 loadCatalog 로 채우고,
 * 쓰기는 API 를 부른 뒤 응답으로 배열을 고친다. 화면은 여기서 동기로 읽는다.
 */

/** 배열을 제자리에서 갈아끼운다 — 다른 모듈이 import 한 참조가 살아 있어야 한다 */
function replaceAll<T>(target: T[], items: T[]): void {
  target.splice(0, target.length, ...items)
}

/**
 * 카테고리는 고정 5종이라 admin 에 만드는 화면이 없다. 서버에 빠진 코드가 있으면 여기서
 * 만든다 — 장소는 존재하는 category_id 가 있어야 생긴다. 다 있으면 요청을 안 보낸다.
 * 만든 순서대로 id 가 매겨져 화면 순서도 CATEGORY_SEED 순서가 된다.
 */
async function ensureCategories(existing: Category[]): Promise<Category[]> {
  const have = new Set(existing.map((c) => c.code))
  const created: Category[] = []
  // 차례로 만든다 — 동시에 보내면 id 순서가 SEED 순서와 어긋날 수 있다
  for (const seed of CATEGORY_SEED) {
    if (!have.has(seed.code)) created.push(await createCategory(seed))
  }
  return [...existing, ...created].sort((a, b) => a.id - b.id)
}

export async function loadCatalog(): Promise<void> {
  const categories = await ensureCategories(await fetchCategories())
  const [places, menus] = await Promise.all([fetchPlaces(), fetchMenus()])
  replaceAll(CATEGORIES, categories)
  replaceAll(PLACES, places)
  replaceAll(MENUS, menus)
  emit()
}

export function placeById(id: number): Place | undefined {
  return PLACES.find((p) => p.id === id)
}

function putPlace(place: Place): void {
  const index = PLACES.findIndex((p) => p.id === place.id)
  if (index < 0) PLACES.push(place)
  else PLACES[index] = place
  emit()
}

/**
 * id 가 없으면 POST, 있으면 PATCH. PATCH 는 보낸 언어만 upsert 한다 — 비운 언어를
 * 지우려면 removePlaceTranslation 을 따로 불러야 한다 (§5.2).
 */
export async function savePlace(id: number | null, body: PlaceWrite): Promise<Place> {
  const saved = id === null ? await createPlace(body) : await updatePlace(id, body)
  putPlace(saved)
  return saved
}

/** 번역을 지우는 유일한 수단. KO 는 서버가 409 로 막는다 */
export async function removePlaceTranslation(id: number, code: LanguageCode): Promise<void> {
  await apiDeletePlaceTranslation(id, code)
  const place = placeById(id)
  if (!place) return
  putPlace({ ...place, translations: place.translations.filter((t) => t.language_code !== code) })
}

/** 번역 삭제 실행취소 — 지운 언어만 PATCH 로 다시 올린다. 언어별 upsert 라 나머지는 그대로다 */
export async function restorePlaceTranslations(
  id: number,
  translations: PlaceTextWrite[],
): Promise<void> {
  putPlace(await updatePlace(id, { translations }))
}

/**
 * 영구 삭제, 하위 메뉴까지 연쇄 (§6). 캐시에서도 그 장소의 메뉴를 같이 뺀다.
 * 이미 없는 것(404)은 지워진 것으로 친다 — 다른 운영자가 먼저 지웠을 수 있다.
 * 지운 메뉴 수를 돌려줘 스낵바에 쓴다.
 */
export async function removePlace(id: number): Promise<number> {
  try {
    await apiDeletePlace(id)
  } catch (error) {
    if (!(isApiError(error) && error.status === 404)) throw error
  }
  const index = PLACES.findIndex((p) => p.id === id)
  if (index >= 0) PLACES.splice(index, 1)
  const before = MENUS.length
  replaceAll(
    MENUS,
    MENUS.filter((m) => m.place_id !== id),
  )
  emit()
  return before - MENUS.length
}

export function menuById(id: number): Menu | undefined {
  return MENUS.find((m) => m.id === id)
}

function putMenu(menu: Menu): void {
  const index = MENUS.findIndex((m) => m.id === menu.id)
  if (index < 0) MENUS.push(menu)
  else MENUS[index] = menu
  emit()
}

/** 장소와 같은 규칙 — id 없으면 POST, 있으면 PATCH(보낸 언어만 upsert) */
export async function saveMenu(id: number | null, body: MenuWrite): Promise<Menu> {
  const saved = id === null ? await createMenu(body) : await updateMenu(id, body)
  putMenu(saved)
  return saved
}

export async function removeMenuTranslation(id: number, code: LanguageCode): Promise<void> {
  await apiDeleteMenuTranslation(id, code)
  const menu = menuById(id)
  if (!menu) return
  putMenu({ ...menu, translations: menu.translations.filter((t) => t.language_code !== code) })
}

/** 번역 삭제 실행취소 — 장소와 같다 */
export async function restoreMenuTranslations(
  id: number,
  translations: MenuTextWrite[],
): Promise<void> {
  putMenu(await updateMenu(id, { translations }))
}

/** 영구 삭제 (§6). 404 는 지워진 것으로 친다 */
export async function removeMenu(id: number): Promise<void> {
  try {
    await apiDeleteMenu(id)
  } catch (error) {
    if (!(isApiError(error) && error.status === 404)) throw error
  }
  const index = MENUS.findIndex((m) => m.id === id)
  if (index >= 0) MENUS.splice(index, 1)
  emit()
}

/**
 * 공연 (§5.6). 여기서 서버 규칙을 흉내내는 것이 중요하다 — seq 와 is_live 는
 * 요청 본문으로 못 보내는 값이라(422), 화면이 그 값을 정하는 코드를 갖게 되면
 * 실제 API 로 바꿀 때 전부 걷어내야 한다. 목에서부터 서버 몫으로 둔다.
 */

/** 저장 화면이 보낼 수 있는 것. seq·is_live 가 빠져 있는 게 핵심이다 */
export type PerformanceDraft = Omit<Performance, 'seq' | 'is_live'>

/** 한 일차의 seq 를 1부터 빈틈 없이 다시 매긴다 (§5.6) */
function renumber(date: string): void {
  PERFORMANCES.filter((p) => p.date === date)
    .sort((a, b) => a.seq - b.seq || a.id - b.id)
    .forEach((p, index) => {
      p.seq = index + 1
    })
}

/** 정렬은 명세 그대로 date ASC, seq ASC, id ASC (§5.1) */
export function performancesByDate(date: string): Performance[] {
  return PERFORMANCES.filter((p) => p.date === date).sort((a, b) => a.seq - b.seq || a.id - b.id)
}

export function performanceById(id: number): Performance | undefined {
  return PERFORMANCES.find((p) => p.id === id)
}

/**
 * 생성이면 그 일차의 맨 뒤에 놓는다. 수정이면서 일차가 바뀌었으면 옮겨간
 * 일차의 맨 뒤로 가고 원래 일차는 다시 매겨진다 (§5.6). is_live 는 수정에서
 * 건드리지 않는다 — 전용 엔드포인트만 바꾼다.
 */
export function upsertPerformance(draft: PerformanceDraft): Performance {
  const index = PERFORMANCES.findIndex((p) => p.id === draft.id)
  const tail = PERFORMANCES.filter((p) => p.date === draft.date).length + 1

  if (index < 0) {
    const created: Performance = { ...draft, seq: tail, is_live: false }
    PERFORMANCES.push(created)
    emit()
    return created
  }

  const previous = PERFORMANCES[index]
  const moved = previous.date !== draft.date

  // §5.2 — 전달하지 않은 언어는 그대로 둔다. 장소·메뉴와 같은 규칙이다
  // (deletePerformanceTranslation 만이 지우는 수단)
  const translations = [...previous.translations]
  for (const next of draft.translations) {
    const at = translations.findIndex((t) => t.language_code === next.language_code)
    if (at >= 0) translations[at] = next
    else translations.push(next)
  }
  translations.sort((a, b) => a.language_code.localeCompare(b.language_code))

  const updated: Performance = {
    ...draft,
    seq: moved ? tail : previous.seq,
    is_live: previous.is_live,
    translations,
  }
  PERFORMANCES[index] = updated
  if (moved) renumber(previous.date)
  emit()
  return updated
}

/** 삭제하면 그 일차의 남은 공연을 다시 매긴다. 지운 것은 실행취소용으로 돌려준다 (§6) */
export function deletePerformance(id: number): Performance | undefined {
  const index = PERFORMANCES.findIndex((p) => p.id === id)
  if (index < 0) return undefined
  const [removed] = PERFORMANCES.splice(index, 1)
  renumber(removed.date)
  emit()
  return removed
}

/** 실행취소. 원래 자리(seq)로 되돌린 뒤 그 일차를 다시 매긴다 */
export function restorePerformance(performance: Performance): void {
  // 같은 seq 를 이미 가져간 공연보다 앞에 서야 원래 자리로 돌아온다
  for (const p of PERFORMANCES) {
    if (p.date === performance.date && p.seq >= performance.seq) p.seq += 1
  }
  PERFORMANCES.push(performance)
  renumber(performance.date)
  emit()
}

/** DELETE /performances/{performance_id}/translations/{language_code} 흉내 (§5.2) */
export function deletePerformanceTranslation(
  performanceId: number,
  code: LanguageCode,
): string | null {
  if (code === 'KO') return '한국어 번역은 지울 수 없습니다.'

  const performance = performanceById(performanceId)
  if (!performance) return '없는 공연입니다.'

  const at = performance.translations.findIndex((t) => t.language_code === code)
  if (at < 0) return '없는 번역입니다.'

  performance.translations.splice(at, 1)
  emit()
  return null
}

/**
 * PUT /performances/{id}/live 흉내. true 면 기존 live 를 내리고 대상만 올린다.
 * 그래서 전체에서 is_live=true 는 항상 최대 1건이다 (§5.6).
 */
export function setLive(id: number, isLive: boolean): Performance | undefined {
  const target = performanceById(id)
  if (!target) return undefined
  if (isLive) {
    for (const p of PERFORMANCES) p.is_live = false
  }
  target.is_live = isLive
  emit()
  return target
}

/**
 * PUT /performances/reorder 흉내. order 는 그 일차의 공연 ID 를 빠짐없이,
 * 중복 없이, 그 일차 것만 담아야 한다. 어긋나면 422 다 — 다른 운영자가 그
 * 사이에 공연을 추가·삭제한 것을 이 검사가 잡아낸다 (§5.6).
 *
 * 통과하면 배열 위치가 곧 seq 다. 거부 사유를 문자열로 돌려 화면이 그대로 띄운다.
 */
export function reorderPerformances(date: string, order: number[]): string | null {
  const current = performancesByDate(date).map((p) => p.id)
  if (order.length === 0) return '순서가 비어 있습니다.'
  if (new Set(order).size !== order.length) return '순서에 같은 공연이 두 번 들어 있습니다.'
  if (order.length !== current.length || order.some((id) => !current.includes(id)))
    return '그 사이 이 일차의 공연이 바뀌었습니다. 새로고침한 뒤 다시 시도해주세요.'

  order.forEach((id, index) => {
    const target = performanceById(id)
    if (target) target.seq = index + 1
  })
  emit()
  return null
}

/**
 * 공지 (§5.7). **실제 API 에 붙은 첫 도메인이다.** NOTICES 는 더 이상 목이 아니라
 * 서버 응답의 캐시다 — 로그인 뒤 DataGate 가 loadNotices 로 전부 받아 채우고, 쓰기는
 * API 를 부른 뒤 응답으로 이 배열을 고친다. 화면은 예전처럼 여기서 동기로 읽는다.
 *
 * 공연과 달리 순서를 손댈 수단이 없다 — 정렬 키가 서버 생성 created_at 하나뿐이라
 * 재정렬 엔드포인트 자체가 없다 (§5.1).
 */

/** 서버에서 전부 받아 캐시를 갈아끼운다. 배열은 제자리에서 바꾼다 — import 한 참조가 살아 있게 */
export async function loadNotices(): Promise<void> {
  const items = await fetchNotices()
  NOTICES.splice(0, NOTICES.length, ...items)
  emit()
}

/** 응답 한 건을 캐시에 넣는다. 있으면 교체, 없으면 추가 */
function putNotice(notice: Notice): void {
  const index = NOTICES.findIndex((n) => n.id === notice.id)
  if (index < 0) NOTICES.push(notice)
  else NOTICES[index] = notice
  emit()
}

/**
 * id 가 없으면 POST, 있으면 PATCH. created_at 은 서버가 찍고 PATCH 로 바뀌지 않는다.
 * PATCH 는 보낸 언어만 upsert 한다 — 비운 언어를 지우려면 removeNoticeTranslation 을
 * 따로 불러야 한다 (§5.2).
 */
export async function saveNotice(id: number | null, body: NoticeWrite): Promise<Notice> {
  const saved = id === null ? await createNotice(body) : await updateNotice(id, body)
  putNotice(saved)
  return saved
}

/** 번역 하나를 지운다. PATCH 로는 못 지운다. KO 는 서버가 409 로 막는다 */
export async function removeNoticeTranslation(id: number, code: LanguageCode): Promise<void> {
  await apiDeleteNoticeTranslation(id, code)
  const notice = noticeById(id)
  if (!notice) return
  putNotice({
    ...notice,
    translations: notice.translations.filter((t) => t.language_code !== code),
  })
}

/**
 * 영구 삭제라 되살릴 수 없다 (§6). 이미 없는 것(404)은 지워진 것으로 친다 — 다른
 * 운영자가 먼저 지웠을 때 "없는 공지" 오류를 내면 운영자가 할 일이 없다.
 */
export async function removeNotice(id: number): Promise<void> {
  try {
    await apiDeleteNotice(id)
  } catch (error) {
    if (!(isApiError(error) && error.status === 404)) throw error
  }
  const index = NOTICES.findIndex((n) => n.id === id)
  if (index >= 0) NOTICES.splice(index, 1)
  emit()
}

/**
 * 명세의 ISO 8601 은 offset 을 포함한다 (§2.2). toISOString() 은 Z 로 끝나서
 * 목 데이터와 모양이 갈린다 — 장소 목의 운영 시각도 +09:00 이다.
 */
function nowKst(): string {
  return `${new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 19)}+09:00`
}

/**
 * 정렬은 명세 그대로 created_at DESC, id DESC (§5.1).
 *
 * 문자열 비교가 아니라 Date.parse 다. 지금은 목도 새로 만든 것도 +09:00 이라
 * 사전순이 시각순과 같지만, offset 이 하나라도 섞이면 (Z 로 오는 응답, 서머타임
 * 없는 다른 지역) 사전순이 조용히 어긋난다. 정렬이 틀리는 버그는 눈에 안 띈다.
 */
export function noticesByType(type: NoticeType): Notice[] {
  return NOTICES.filter((n) => n.type === type).sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at) || b.id - a.id,
  )
}

export function noticeById(id: number): Notice | undefined {
  return NOTICES.find((n) => n.id === id)
}

/**
 * 분실물 (§5.8). 공지와 마찬가지로 순서를 손댈 수단이 없다 — 정렬 키가 서버
 * 생성 created_at 하나뿐이라 재정렬 엔드포인트 자체가 없다 (§5.1).
 *
 * 서버 몫은 created_at 하나뿐이다. is_returned 는 **POST 필수, PATCH 선택**이라
 * (§5.8) 생성 본문에 반드시 실려야 한다 — draft 에서 빼면 실을 값이 없어 422 다.
 *
 * 공연의 seq·is_live 와 헷갈리기 쉬운 자리다. 그쪽은 §5.6 이 "보내지 않음,
 * 넣으면 422" 로 못박고 전용 엔드포인트(PUT /performances/{id}/live)로만 바꾸지만,
 * 분실물에는 전용 엔드포인트가 없다. 반환 처리도 공용 PATCH 로 간다.
 */

/** 저장 화면이 보낼 수 있는 것. 빠지는 것은 created_at 하나다 */
export type LostItemDraft = Omit<LostItem, 'created_at'>

/**
 * 정렬은 명세 그대로 created_at DESC, id DESC (§5.1).
 *
 * 문자열 비교가 아니라 Date.parse 다. 지금은 목도 새로 만든 것도 +09:00 이라
 * 사전순이 시각순과 같지만, offset 이 하나라도 섞이면 조용히 어긋난다.
 */
export function lostItemsByReturned(isReturned: boolean): LostItem[] {
  return LOST_ITEMS.filter((item) => item.is_returned === isReturned).sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at) || b.id - a.id,
  )
}

export function lostItemById(id: number): LostItem | undefined {
  return LOST_ITEMS.find((item) => item.id === id)
}

/**
 * 생성이면 지금 시각을 서버가 찍고, is_returned 는 draft 가 실어 온 값을 쓴다
 * (POST 필수 — §5.8). 화면은 언제나 false 를 보낸다. 주워 온 물건이 이미
 * 반환됐을 수는 없다.
 *
 * 수정이면 created_at 과 is_returned 를 모두 그대로 둔다 — 전자는 수정 불가
 * 필드고, 후자는 PATCH 에서 선택이라 안 보낸 것으로 친다. 반환 상태를 바꾸는
 * 것은 목록의 반환 버튼(setReturned)이다. 편집 화면에서 저장했다고 반환 상태가
 * 되돌아가면 안 된다.
 */
export function upsertLostItem(draft: LostItemDraft): LostItem {
  const index = LOST_ITEMS.findIndex((item) => item.id === draft.id)

  if (index < 0) {
    const created: LostItem = { ...draft, created_at: nowKst() }
    LOST_ITEMS.push(created)
    emit()
    return created
  }

  const previous = LOST_ITEMS[index]

  // §5.2 — PATCH 는 전달한 언어만 upsert 하고 **전달하지 않은 언어는 그대로 둔다.**
  // 배열을 통째로 갈아끼우면 화면이 "비우고 저장하면 지워진다" 고 믿게 되는데
  // 실제 API 는 그렇게 동작하지 않는다. 번역 삭제는 전용 경로만이다
  // (deleteLostItemTranslation). 목에서부터 같은 규칙을 지켜야 그 차이가 드러난다.
  const translations = [...previous.translations]
  for (const next of draft.translations) {
    const at = translations.findIndex((t) => t.language_code === next.language_code)
    if (at >= 0) translations[at] = next
    else translations.push(next)
  }
  // 응답의 translations 는 language_code ASC = CHN → EN → KO (§5.2)
  translations.sort((a, b) => a.language_code.localeCompare(b.language_code))

  const updated: LostItem = {
    ...draft,
    created_at: previous.created_at,
    is_returned: previous.is_returned,
    translations,
  }
  LOST_ITEMS[index] = updated
  emit()
  return updated
}

/**
 * DELETE /lost-items/{lost_item_id}/translations/{language_code} 흉내 (§5.2).
 *
 * 번역을 지우는 유일한 수단이다. PATCH 로는 못 지운다 — 안 보낸 언어는
 * 유지되기 때문이다. 거부 사유를 문자열로 돌려 화면이 그대로 띄운다
 * (공연 reorder 부터 이어온 관례).
 */
export function deleteLostItemTranslation(lostItemId: number, code: LanguageCode): string | null {
  // KO 는 모든 기본 리소스에 필요한 번역이라 409 DELETE_CONFLICT 다.
  // 화면은 KO 필수 검증으로 저장 자체를 먼저 막으므로 여기까지 오지 않지만,
  // 계약을 코드에 남겨 둔다
  if (code === 'KO') return '한국어 번역은 지울 수 없습니다.'

  const item = lostItemById(lostItemId)
  if (!item) return '없는 분실물입니다.'

  // 기본 리소스나 그 언어 번역이 없으면 404 RESOURCE_NOT_FOUND
  const at = item.translations.findIndex((t) => t.language_code === code)
  if (at < 0) return '없는 번역입니다.'

  item.translations.splice(at, 1)
  emit()
  return null
}

/** 지운 것을 돌려줘 실행취소에 쓴다 (§6) */
export function deleteLostItem(id: number): LostItem | undefined {
  const index = LOST_ITEMS.findIndex((item) => item.id === id)
  if (index < 0) return undefined
  const [removed] = LOST_ITEMS.splice(index, 1)
  emit()
  return removed
}

/** 실행취소. 정렬이 created_at 이라 자리를 따로 맞출 것이 없다 */
export function restoreLostItem(item: LostItem): void {
  LOST_ITEMS.push(item)
  emit()
}

/**
 * PATCH /lost-items/{id} 의 is_returned 흉내.
 *
 * 공연의 setLive 와 모양은 같지만 **배타성이 없다.** 현재 공연은 전체에서 최대
 * 1건이라 하나를 켜면 나머지가 내려가지만, 반환된 분실물은 여럿이 정상이다.
 */
export function setReturned(id: number, isReturned: boolean): LostItem | undefined {
  const target = lostItemById(id)
  if (!target) return undefined
  target.is_returned = isReturned
  emit()
  return target
}
