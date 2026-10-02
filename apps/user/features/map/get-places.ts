import type { Localized } from '@quen/schema/common/localize'
import type { Page } from '@quen/schema/common/page'
import type { CategoryBase, CategoryText } from '@quen/schema/entities/category'
import type { PlaceBase, PlaceText } from '@quen/schema/entities/place'
import { CACHE_TAGS } from '@/shared/api/cache-tags'
import { serverApi } from '@/shared/api/server-api'
import type { MapPlace, PlaceCode, PlaceMenu } from './map-place'

type Category = Localized<CategoryBase, CategoryText>
type PlaceItem = Localized<PlaceBase, PlaceText>

// 명세 최대치
const PAGE_SIZE = 100

// 시트에 메뉴를 보여 주는 카테고리. 목록 응답엔 메뉴가 없어 이 장소들만 상세를 한 번 더 받는다
const MENU_CODES: ReadonlySet<PlaceCode> = new Set(['BOOTH', 'PUB', 'FOODTRUCK'])

/** 목록을 100건씩 끝까지 받는다. 장소는 백 건을 넘을 수 있다 */
async function listAll<T>(path: string): Promise<T[]> {
  const items: T[] = []
  for (let page = 1; ; page++) {
    const res = await serverApi<Page<T>>(path, {
      tags: [CACHE_TAGS.places],
      query: { page: String(page), size: String(PAGE_SIZE) },
    })
    items.push(...res.items)
    if (res.items.length < PAGE_SIZE || items.length >= res.total) return items
  }
}

/** 페이지 언어의 장소 전체. category_id 를 카테고리 코드로 풀고, 모르는 카테고리는 마커를 정할 수 없어 뺀다. 메뉴가 바뀌어도 places 태그로 재검증된다 */
export async function getPlaces(): Promise<MapPlace[]> {
  // 카테고리도 장소 화면에만 쓰여 places 태그로 함께 비운다
  const [categories, places] = await Promise.all([
    listAll<Category>('/categories'),
    listAll<PlaceItem>('/places'),
  ])
  const codes = new Map(categories.map(({ id, code }) => [id, code]))
  return Promise.all(
    places.flatMap((place) => {
      const code = codes.get(place.category_id)
      if (!code) return []
      if (!MENU_CODES.has(code)) return [Promise.resolve({ ...place, code, menus: [] })]
      return [
        serverApi<{ menus: PlaceMenu[] }>(`/places/${place.id}`, {
          tags: [CACHE_TAGS.places],
        }).then(({ menus }) => ({ ...place, code, menus })),
      ]
    }),
  )
}
