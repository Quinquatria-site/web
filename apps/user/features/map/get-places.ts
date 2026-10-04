import type { Localized, MaybeLocalized } from '@quen/schema/common/localize'
import type { Page } from '@quen/schema/common/page'
import type { CategoryBase, CategoryText } from '@quen/schema/entities/category'
import type { PlaceBase, PlaceText } from '@quen/schema/entities/place'
import { CACHE_TAGS } from '@/shared/api/cache-tags'
import { serverApi } from '@/shared/api/server-api'
import { listWithSource, pairWithSource } from '@/shared/api/source-fallback'
import type { MapPoint } from './map-coords'
import type { MapPlace, PlaceCode, PlaceMenu } from './map-place'

type Category = Localized<CategoryBase, CategoryText>
type PlaceItem = MaybeLocalized<PlaceBase, PlaceText>

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

// 고를 때 화면을 옮길 기준점. 꼭짓점들의 평균이다
function centerOf(area: MapPoint[]): MapPoint {
  const sum = area.reduce((acc, { x, y }) => ({ x: acc.x + x, y: acc.y + y }), { x: 0, y: 0 })
  return { x: sum.x / area.length, y: sum.y / area.length }
}

// 구역 장소는 꼭짓점과 그 가운데를, 점 장소는 좌표를 위치로 둔다. 위치를 아직 정하지 않았으면 그릴 자리가 없어 null
function placeLocation({ is_polygon, x, y, area }: PlaceItem) {
  if (is_polygon) return area?.length ? { ...centerOf(area), is_polygon, area } : null
  // 받은 area 는 null 이라 덮어써 둔다
  return x === null || y === null ? null : { x, y, is_polygon, area: undefined }
}

/** 페이지 언어의 장소 전체, 번역이 없는 장소·메뉴는 한국어로. category_id 를 카테고리 코드로 풀고, 카테고리나 위치가 없는 장소는 그릴 수 없어 뺀다. 메뉴가 바뀌어도 places 태그로 재검증된다 */
export async function getPlaces(): Promise<MapPlace[]> {
  // 지도는 두 태그를 다 달고 있어, 백엔드가 카테고리를 바꿔 categories 를 보내도 다시 굽는다
  const [categories, places] = await Promise.all([
    listAll<Category>('/categories', CACHE_TAGS.categories),
    pairWithSource((source) => listAll<PlaceItem>('/places', CACHE_TAGS.places, source)),
  ])
  const codes = new Map(categories.map(({ id, code }) => [id, code]))
  return Promise.all(
    places.flatMap(({ item, source }) => {
      const code = item.category_id === null ? undefined : codes.get(item.category_id)
      const location = placeLocation(item)
      if (!code || !location) return []
      const place = {
        ...item,
        ...location,
        code,
        source: item === source ? null : { name: source.name, host_college: source.host_college },
      }
      if (!MENU_CODES.has(code)) return [Promise.resolve({ ...place, menus: [] })]
      const menus = listWithSource((source) =>
        serverApi<{ menus: PlaceMenu[] }>(`/places/${place.id}`, {
          tags: [CACHE_TAGS.places],
          source,
        }).then((detail) => detail.menus),
      )
      return [menus.then((items) => ({ ...place, menus: items }))]
    }),
  )
}
