import type { Menu } from './types'

/**
 * 메뉴 캐시. 서버 응답을 담아두는 자리다 — store.ts 의 loadCatalog 가 채운다.
 *
 * 메뉴는 독립 리소스지만(§5.5) 화면에서는 장소 편집 안에서 place_id 로 걸러 쓴다.
 * 장소를 지우면 서버가 메뉴까지 연쇄 삭제하므로 캐시에서도 같이 뺀다(store.removePlace).
 */
export const MENUS: Menu[] = []

export function menusByPlace(placeId: number): Menu[] {
  return MENUS.filter((m) => m.place_id === placeId).sort((a, b) => a.id - b.id)
}
