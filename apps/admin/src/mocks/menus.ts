import type { Menu } from './types'

/**
 * 메뉴는 독립 리소스지만(§5.5) 화면에서는 장소 편집 안에서 place_id 로 걸러 쓴다.
 * price 는 원 단위 0 이상 정수.
 */
export const MENUS: Menu[] = [
  // 통번역대학 주점 (place 10)
  {
    id: 101,
    place_id: 10,
    image_url: 'images/menu/mock-tteok.webp',
    price: 5000,
    translations: [
      { id: 10113, menu_id: 101, language_code: 'CHN', name: '辣炒年糕', description: '香辣年糕' },
      {
        id: 10112,
        menu_id: 101,
        language_code: 'EN',
        name: 'Tteokbokki',
        description: 'Spicy rice cakes',
      },
      {
        id: 10111,
        menu_id: 101,
        language_code: 'KO',
        name: '떡볶이',
        description: '매운 떡볶이',
      },
    ],
  },
  {
    id: 102,
    place_id: 10,
    image_url: 'images/menu/mock-pajeon.webp',
    price: 12000,
    translations: [
      {
        id: 10212,
        menu_id: 102,
        language_code: 'EN',
        name: 'Seafood Pancake',
        description: 'Korean savory pancake',
      },
      {
        id: 10211,
        menu_id: 102,
        language_code: 'KO',
        name: '해물파전',
        description: '바삭한 해물파전',
      },
    ],
  },
  // 동유럽학대학 주점 (place 11)
  {
    id: 111,
    place_id: 11,
    image_url: 'images/menu/mock-goulash.webp',
    price: 9000,
    // KO 만 — 장소도 KO 만이라 함께 경고 대상
    translations: [
      {
        id: 11111,
        menu_id: 111,
        language_code: 'KO',
        name: '굴라시',
        description: '헝가리식 쇠고기 스튜',
      },
    ],
  },
  // 부스 A-1 (place 1001) — 유료 체험 예시
  {
    id: 201,
    place_id: 1001,
    image_url: 'images/menu/mock-tarot.webp',
    price: 3000,
    translations: [
      {
        id: 20113,
        menu_id: 201,
        language_code: 'CHN',
        name: '塔罗一次',
        description: '一个问题',
      },
      {
        id: 20112,
        menu_id: 201,
        language_code: 'EN',
        name: 'Tarot Session',
        description: 'One question',
      },
      {
        id: 20111,
        menu_id: 201,
        language_code: 'KO',
        name: '타로 1회',
        description: '질문 1개',
      },
    ],
  },
  // 꼬치 트럭 (place 30)
  {
    id: 301,
    place_id: 30,
    image_url: 'images/menu/mock-skewer.webp',
    price: 4000,
    translations: [
      {
        id: 30112,
        menu_id: 301,
        language_code: 'EN',
        name: 'Chicken Skewer',
        description: 'Grilled chicken skewer',
      },
      {
        id: 30111,
        menu_id: 301,
        language_code: 'KO',
        name: '닭꼬치',
        description: '숯불 닭꼬치',
      },
    ],
  },
]

export function menusByPlace(placeId: number): Menu[] {
  return MENUS.filter((m) => m.place_id === placeId).sort((a, b) => a.id - b.id)
}
