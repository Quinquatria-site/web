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
import {
  createPerformance,
  deletePerformance as apiDeletePerformance,
  deletePerformanceTranslation as apiDeletePerformanceTranslation,
  fetchPerformances,
  putPerformanceLive,
  putPerformanceOrder,
  updatePerformance,
  type PerformanceTextWrite,
  type PerformanceWrite,
} from '../api/performances'
import {
  createLostItem,
  deleteLostItem as apiDeleteLostItem,
  deleteLostItemTranslation as apiDeleteLostItemTranslation,
  fetchLostItems,
  updateLostItem,
  type LostItemPatch,
  type LostItemWrite,
} from '../api/lostItems'
import { assertAllCategories, CATEGORIES } from './categories'
import { LOST_ITEMS } from './lostItems'
import { MENUS } from './menus'
import { NOTICES } from './notices'
import { PERFORMANCES } from './performances'
import { PLACES } from './places'
import {
  FESTIVAL_DATES,
  type LanguageCode,
  type LostItem,
  type Menu,
  type Notice,
  type NoticeType,
  type Performance,
  type Place,
} from './types'

/**
 * 도메인 데이터의 한 자리. 화면은 여기서 동기로 읽는다.
 *
 * **모든 도메인(공지·카테고리·장소·메뉴·공연·분실물)이 API 캐시다.** 서버에서 받아 채우고,
 * 쓰기는 API 를 부른 뒤 응답으로 배열을 고친다.
 */

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

export async function loadCatalog(): Promise<void> {
  const categories = await fetchCategories()
  assertAllCategories(categories)
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
 * 공연 (§5.6). 공지·카탈로그와 같은 API 캐시다. seq 와 is_live 는 서버 몫이라 요청
 * 본문으로 못 보낸다(422). 화면은 그 값을 정하는 코드를 갖지 않는다 — 생성·일차 이동은
 * 서버가 맨 뒤로 놓고, 순서는 reorder, 현재 공연은 live 전용 엔드포인트로만 바뀐다.
 *
 * 응답이 한 건뿐인 쓰기(삭제·일차 이동·live)는 서버가 **다른 공연도** 바꾼다. 그 몫은
 * 서버와 같은 규칙으로 캐시에서 따라 고친다(renumber, live 내리기). 다른 운영자가 바꾼
 * 것은 창에 돌아올 때 DataGate 가 다시 받아 맞춘다.
 */

export async function loadPerformances(): Promise<void> {
  replaceAll(PERFORMANCES, await fetchPerformances())
  emit()
}

/** 한 일차의 seq 를 1부터 빈틈 없이 다시 매긴다. 서버의 renumber 와 같은 규칙 (§5.6) */
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
 * 일차가 FESTIVAL_DATES 밖인 공연. 서버는 아무 YYYY-MM-DD 나 받으므로 이런 공연이
 * 있을 수 있는데, 목록은 일차 탭으로만 보여줘서 그대로면 어디에도 안 보인다.
 * 목록이 따로 알려 편집 화면에서 일차를 옮길 수 있게 한다.
 */
export function performancesOutsideFestival(): Performance[] {
  return PERFORMANCES.filter((p) => !FESTIVAL_DATES.some((date) => date === p.date)).sort(
    (a, b) => a.date.localeCompare(b.date) || a.seq - b.seq || a.id - b.id,
  )
}

function putPerformance(performance: Performance): void {
  const index = PERFORMANCES.findIndex((p) => p.id === performance.id)
  if (index < 0) PERFORMANCES.push(performance)
  else PERFORMANCES[index] = performance
  emit()
}

/**
 * id 가 없으면 POST, 있으면 PATCH. PATCH 는 보낸 언어만 upsert 한다 — 비운 언어를
 * 지우려면 removePerformanceTranslation 을 따로 불러야 한다 (§5.2).
 *
 * PATCH 에서 사진이 그대로면 image_uri 를 빼고 보낸다. 같은 key 는 서버도 무변경으로
 * 치지만, 안 보내면 사진과 무관한 수정이 이미지 확인에 걸릴 일이 아예 없다.
 * 일차를 옮겼으면 서버가 원래 일차를 다시 매기므로 캐시도 따라 매긴다.
 */
export async function savePerformance(
  id: number | null,
  body: PerformanceWrite,
): Promise<Performance> {
  if (id === null) {
    const created = await createPerformance(body)
    putPerformance(created)
    return created
  }
  const previous = performanceById(id)
  const { image_uri, ...rest } = body
  const saved = await updatePerformance(id, previous?.image_uri === image_uri ? rest : body)
  const index = PERFORMANCES.findIndex((p) => p.id === saved.id)
  if (index < 0) PERFORMANCES.push(saved)
  else PERFORMANCES[index] = saved
  if (previous && previous.date !== saved.date) renumber(previous.date)
  emit()
  return saved
}

/** 번역을 지우는 유일한 수단. KO 는 서버가 409 로 막는다 */
export async function removePerformanceTranslation(id: number, code: LanguageCode): Promise<void> {
  await apiDeletePerformanceTranslation(id, code)
  const performance = performanceById(id)
  if (!performance) return
  putPerformance({
    ...performance,
    translations: performance.translations.filter((t) => t.language_code !== code),
  })
}

/** 번역 삭제 실행취소 — 지운 언어만 PATCH 로 다시 올린다. 장소와 같다 */
export async function restorePerformanceTranslations(
  id: number,
  translations: PerformanceTextWrite[],
): Promise<void> {
  putPerformance(await updatePerformance(id, { translations }))
}

/**
 * 영구 삭제라 되살릴 수 없다 (§6). 서버가 그 일차를 다시 매기므로 캐시도 따라 매긴다.
 * 이미 없는 것(404)은 지워진 것으로 친다 — 다른 운영자가 먼저 지웠을 수 있다.
 */
export async function removePerformance(id: number): Promise<void> {
  try {
    await apiDeletePerformance(id)
  } catch (error) {
    if (!(isApiError(error) && error.status === 404)) throw error
  }
  const index = PERFORMANCES.findIndex((p) => p.id === id)
  if (index >= 0) {
    const [removed] = PERFORMANCES.splice(index, 1)
    renumber(removed.date)
  }
  emit()
}

/**
 * PUT /performances/{id}/live. true 면 서버가 기존 live 를 내리고 대상만 올린다 — 전체에서
 * is_live=true 는 최대 1건이다 (§5.6). 응답은 대상 한 건뿐이라 내려간 쪽은 여기서 내린다.
 */
export async function setPerformanceLive(id: number, isLive: boolean): Promise<Performance> {
  const saved = await putPerformanceLive(id, isLive)
  if (saved.is_live) {
    for (const p of PERFORMANCES) if (p.id !== saved.id) p.is_live = false
  }
  putPerformance(saved)
  return saved
}

/**
 * PUT /performances/reorder. order 는 그 일차의 공연 ID 를 빠짐없이, 중복 없이 담아야
 * 한다. 어긋나면 422 다 — 다른 운영자가 그 사이에 추가·삭제한 것을 이 검사가 잡는다.
 * 204 라 본문이 없어서, 통과하면 배열 위치를 곧 seq 로 캐시에 적는다.
 */
export async function reorderPerformances(date: string, order: number[]): Promise<void> {
  await putPerformanceOrder(date, order)
  order.forEach((id, index) => {
    const target = performanceById(id)
    if (target) target.seq = index + 1
  })
  emit()
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
 * 분실물 (§5.8). 공지와 같은 틀의 API 캐시다 — DataGate 가 loadLostItems 로 채우고,
 * 쓰기는 API 를 부른 뒤 응답으로 LOST_ITEMS 를 고친다. 정렬 키가 서버 생성 created_at
 * 하나뿐이라 재정렬 엔드포인트는 없다 (§5.1).
 *
 * is_returned 는 **POST 필수, PATCH 선택**이다. 공연의 is_live 와 달리 전용
 * 엔드포인트가 없어 반환 처리도 공용 PATCH 로 간다.
 */

/** 서버에서 전부 받아 캐시를 갈아끼운다. 배열은 제자리에서 바꾼다 — import 한 참조가 살아 있게 */
export async function loadLostItems(): Promise<void> {
  replaceAll(LOST_ITEMS, await fetchLostItems())
  emit()
}

/** 응답 한 건을 캐시에 넣는다. 있으면 교체, 없으면 추가 */
function putLostItem(item: LostItem): void {
  const index = LOST_ITEMS.findIndex((i) => i.id === item.id)
  if (index < 0) LOST_ITEMS.push(item)
  else LOST_ITEMS[index] = item
  emit()
}

/**
 * 정렬은 명세 그대로 created_at DESC, id DESC (§5.1).
 *
 * 문자열 비교가 아니라 Date.parse 다. offset 이 하나라도 섞이면 사전순이 조용히 어긋난다.
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
 * id 가 없으면 POST, 있으면 PATCH. 생성 본문에는 is_returned 가 꼭 실려야 한다.
 * PATCH 는 보낸 필드·언어만 바꾼다 — 편집 화면은 is_returned 를 빼고 보내 반환 상태를
 * 건드리지 않고, 비운 언어는 removeLostItemTranslation 을 따로 불러야 지워진다 (§5.2).
 */
export async function saveLostItem(
  id: number | null,
  body: LostItemWrite | LostItemPatch,
): Promise<LostItem> {
  const saved =
    id === null ? await createLostItem(body as LostItemWrite) : await updateLostItem(id, body)
  putLostItem(saved)
  return saved
}

/** 번역 하나를 지운다. PATCH 로는 못 지운다. KO 는 서버가 409 로 막는다 */
export async function removeLostItemTranslation(id: number, code: LanguageCode): Promise<void> {
  await apiDeleteLostItemTranslation(id, code)
  const item = lostItemById(id)
  if (!item) return
  putLostItem({
    ...item,
    translations: item.translations.filter((t) => t.language_code !== code),
  })
}

/** 영구 삭제라 되살릴 수 없다 (§6). 이미 없는 것(404)은 지워진 것으로 친다 */
export async function removeLostItem(id: number): Promise<void> {
  try {
    await apiDeleteLostItem(id)
  } catch (error) {
    if (!(isApiError(error) && error.status === 404)) throw error
  }
  const index = LOST_ITEMS.findIndex((item) => item.id === id)
  if (index >= 0) LOST_ITEMS.splice(index, 1)
  emit()
}

/**
 * 반환 처리. 공연의 setLive 와 모양은 같지만 **배타성이 없다** — 반환된 분실물은
 * 여럿이 정상이다.
 */
export async function setReturned(id: number, isReturned: boolean): Promise<LostItem> {
  return saveLostItem(id, { is_returned: isReturned })
}
