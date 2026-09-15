import type { Category } from './types'

/**
 * 카테고리 5종 전부 (§2.3 CATEGORY.code).
 * 번역 배열은 Backoffice 응답 정렬인 language_code ASC 다: CHN → EN → KO.
 */
export const CATEGORIES: Category[] = [
  {
    id: 1,
    code: 'PUB',
    category_icon_uri: 'images/category/mock-pub.webp',
    translations: [
      { id: 103, category_id: 1, language_code: 'CHN', name: '酒馆' },
      { id: 102, category_id: 1, language_code: 'EN', name: 'Pub' },
      { id: 101, category_id: 1, language_code: 'KO', name: '주점' },
    ],
  },
  {
    id: 2,
    code: 'BOOTH',
    category_icon_uri: 'images/category/mock-booth.webp',
    translations: [
      { id: 203, category_id: 2, language_code: 'CHN', name: '摊位' },
      { id: 202, category_id: 2, language_code: 'EN', name: 'Booth' },
      { id: 201, category_id: 2, language_code: 'KO', name: '부스' },
    ],
  },
  {
    id: 3,
    code: 'FOODTRUCK',
    category_icon_uri: 'images/category/mock-foodtruck.webp',
    translations: [
      { id: 303, category_id: 3, language_code: 'CHN', name: '餐车' },
      { id: 302, category_id: 3, language_code: 'EN', name: 'Food Truck' },
      { id: 301, category_id: 3, language_code: 'KO', name: '푸드트럭' },
    ],
  },
  {
    id: 4,
    code: 'MEDI',
    category_icon_uri: 'images/category/mock-medi.webp',
    translations: [
      { id: 403, category_id: 4, language_code: 'CHN', name: '医务室' },
      { id: 402, category_id: 4, language_code: 'EN', name: 'First Aid' },
      { id: 401, category_id: 4, language_code: 'KO', name: '의무실' },
    ],
  },
  {
    id: 5,
    code: 'BRACELET',
    category_icon_uri: 'images/category/mock-bracelet.webp',
    translations: [
      { id: 503, category_id: 5, language_code: 'CHN', name: '手环领取处' },
      { id: 502, category_id: 5, language_code: 'EN', name: 'Bracelet Pickup' },
      { id: 501, category_id: 5, language_code: 'KO', name: '팔찌 수령소' },
    ],
  },
]

export function categoryById(id: number): Category | undefined {
  return CATEGORIES.find((c) => c.id === id)
}
