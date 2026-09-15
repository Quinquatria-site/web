import { MENUS } from './menus'
import { PERFORMANCES } from './performances'
import { PLACES } from './places'
import type { Menu, Performance, Place } from './types'

/**
 * 목 데이터의 쓰기 흉내. 실제 API(#10)가 붙으면 이 파일이 POST·PATCH·DELETE
 * 호출로 바뀌고 호출부는 그대로 남는다.
 *
 * SPA 세션 동안만 유지된다 — 새로고침하면 초기 목으로 돌아간다. 목업이라 의도된
 * 동작이고, 화면 상단에 따로 알리지 않는다.
 */

let nextId = 900

export function draftId(): number {
  nextId += 1
  return nextId
}

export function placeById(id: number): Place | undefined {
  return PLACES.find((p) => p.id === id)
}

/** §5.2 — 기본 필드 수정과 번역 upsert 를 한 번에. 반환값은 저장된 장소 */
export function upsertPlace(place: Place): Place {
  const index = PLACES.findIndex((p) => p.id === place.id)
  if (index >= 0) PLACES[index] = place
  else PLACES.push(place)
  return place
}

/** §6 — 장소 삭제는 하위 메뉴와 번역을 연쇄 삭제한다. 지운 것들을 돌려줘 실행취소에 쓴다 */
export function deletePlace(id: number): { place: Place; menus: Menu[] } | undefined {
  const index = PLACES.findIndex((p) => p.id === id)
  if (index < 0) return undefined
  const [place] = PLACES.splice(index, 1)
  const menus: Menu[] = []
  for (let i = MENUS.length - 1; i >= 0; i -= 1) {
    if (MENUS[i].place_id === id) menus.unshift(...MENUS.splice(i, 1))
  }
  return { place, menus }
}

export function restorePlace(place: Place, menus: Menu[]): void {
  PLACES.push(place)
  MENUS.push(...menus)
}

export function menuById(id: number): Menu | undefined {
  return MENUS.find((m) => m.id === id)
}

export function upsertMenu(menu: Menu): Menu {
  const index = MENUS.findIndex((m) => m.id === menu.id)
  if (index >= 0) MENUS[index] = menu
  else MENUS.push(menu)
  return menu
}

export function deleteMenu(id: number): Menu | undefined {
  const index = MENUS.findIndex((m) => m.id === id)
  if (index < 0) return undefined
  return MENUS.splice(index, 1)[0]
}

export function restoreMenu(menu: Menu): void {
  MENUS.push(menu)
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
    return created
  }

  const previous = PERFORMANCES[index]
  const moved = previous.date !== draft.date
  const updated: Performance = {
    ...draft,
    seq: moved ? tail : previous.seq,
    is_live: previous.is_live,
  }
  PERFORMANCES[index] = updated
  if (moved) renumber(previous.date)
  return updated
}

/** 삭제하면 그 일차의 남은 공연을 다시 매긴다. 지운 것은 실행취소용으로 돌려준다 (§6) */
export function deletePerformance(id: number): Performance | undefined {
  const index = PERFORMANCES.findIndex((p) => p.id === id)
  if (index < 0) return undefined
  const [removed] = PERFORMANCES.splice(index, 1)
  renumber(removed.date)
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
  return null
}
