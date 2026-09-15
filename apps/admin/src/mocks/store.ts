import { useSyncExternalStore } from 'react'
import { MENUS } from './menus'
import { PLACES } from './places'
import type { Menu, Place } from './types'

/**
 * 목 데이터의 쓰기 흉내. 실제 API(#10)가 붙으면 이 파일이 POST·PATCH·DELETE
 * 호출로 바뀌고 호출부는 그대로 남는다.
 *
 * SPA 세션 동안만 유지된다 — 새로고침하면 초기 목으로 돌아간다. 목업이라 의도된
 * 동작이고, 화면 상단에 따로 알리지 않는다.
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

export function placeById(id: number): Place | undefined {
  return PLACES.find((p) => p.id === id)
}

/** §5.2 — 기본 필드 수정과 번역 upsert 를 한 번에. 반환값은 저장된 장소 */
export function upsertPlace(place: Place): Place {
  const index = PLACES.findIndex((p) => p.id === place.id)
  if (index >= 0) PLACES[index] = place
  else PLACES.push(place)
  emit()
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
  emit()
  return { place, menus }
}

export function restorePlace(place: Place, menus: Menu[]): void {
  PLACES.push(place)
  MENUS.push(...menus)
  emit()
}

export function menuById(id: number): Menu | undefined {
  return MENUS.find((m) => m.id === id)
}

export function upsertMenu(menu: Menu): Menu {
  const index = MENUS.findIndex((m) => m.id === menu.id)
  if (index >= 0) MENUS[index] = menu
  else MENUS.push(menu)
  emit()
  return menu
}

export function deleteMenu(id: number): Menu | undefined {
  const index = MENUS.findIndex((m) => m.id === id)
  if (index < 0) return undefined
  const [menu] = MENUS.splice(index, 1)
  emit()
  return menu
}

export function restoreMenu(menu: Menu): void {
  MENUS.push(menu)
  emit()
}
