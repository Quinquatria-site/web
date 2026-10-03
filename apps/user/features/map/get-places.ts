import type { Localized } from '@quen/schema/common/localize'
import type { Page } from '@quen/schema/common/page'
import type { CategoryBase, CategoryText } from '@quen/schema/entities/category'
import type { PlaceBase, PlaceText } from '@quen/schema/entities/place'
import { CACHE_TAGS } from '@/shared/api/cache-tags'
import { serverApi } from '@/shared/api/server-api'
import { listWithSource } from '@/shared/api/source-fallback'
import { getLocale } from '@/shared/i18n/get-locale'
import { getLocalPlaces } from './local-places'
import type { MapPlace, PlaceCode, PlaceMenu } from './map-place'

type Category = Localized<CategoryBase, CategoryText>
type PlaceItem = Localized<PlaceBase, PlaceText>

// 명세 최대치
const PAGE_SIZE = 100

// 시트에 메뉴를 보여 주는 카테고리. 목록 응답엔 메뉴가 없어 이 장소들만 상세를 한 번 더 받는다
const MENU_CODES: ReadonlySet<PlaceCode> = new Set(['BOOTH', 'PUB', 'FOODTRUCK'])

/** 목록을 100건씩 끝까지 받는다. 장소는 백 건을 넘을 수 있다 */
async function listAll<T>(path: string, tag: string, source = false): Promise<T[]> {
  const items: T[] = []
  for (let page = 1; ; page++) {
    const res = await serverApi<Page<T>>(path, {
      tags: [tag],
      query: { page: String(page), size: String(PAGE_SIZE) },
      source,
    })
    items.push(...res.items)
    if (res.items.length < PAGE_SIZE || items.length >= res.total) return items
  }
}

/** 페이지 언어의 장소 전체, 번역이 없는 장소·메뉴는 한국어로. 서버 장소 뒤에 프론트에 둔 장소를 붙인다 */
export async function getPlaces(): Promise<MapPlace[]> {
  const [serverPlaces, locale] = await Promise.all([getServerPlaces(), getLocale()])
  return [...serverPlaces, ...getLocalPlaces(locale)]
}

// category_id 를 카테고리 코드로 풀고, 모르는 카테고리는 마커를 정할 수 없어 뺀다. 메뉴가 바뀌어도 places 태그로 재검증된다
async function getServerPlaces(): Promise<MapPlace[]> {
  // 지도는 두 태그를 다 달고 있어, 백엔드가 카테고리를 바꿔 categories 를 보내도 다시 굽는다
  const [categories, places] = await Promise.all([
    listAll<Category>('/categories', CACHE_TAGS.categories),
    listWithSource((source) => listAll<PlaceItem>('/places', CACHE_TAGS.places, source)),
  ])
  const codes = new Map(categories.map(({ id, code }) => [id, code]))
  return Promise.all(
    places.flatMap((place) => {
      const code = codes.get(place.category_id)
      if (!code) return []
      if (!MENU_CODES.has(code)) return [Promise.resolve({ ...place, code, menus: [] })]
      const menus = listWithSource((source) =>
        serverApi<{ menus: PlaceMenu[] }>(`/places/${place.id}`, {
          tags: [CACHE_TAGS.places],
          source,
        }).then((detail) => detail.menus),
      )
      return [menus.then((items) => ({ ...place, code, menus: items }))]
    }),
  )
}
