import type { CategoryWrite } from '../api/catalog'
import type { Category } from './types'

/**
 * 카테고리 캐시. 서버 응답을 담아두는 자리다 — store.ts 의 loadCatalog 가 채운다.
 *
 * 화면의 순서(목록 칩·지도 범례·장소 편집 선택지)는 서버 응답 순서(`id ASC`)다.
 * CATEGORY_SEED 순서대로 만들므로 결국 주점→부스→푸드트럭→의무실→팔찌 순이 된다.
 */
export const CATEGORIES: Category[] = []

export function categoryById(id: number): Category | undefined {
  return CATEGORIES.find((c) => c.id === id)
}

/**
 * 서버에 없으면 admin 이 만드는 카테고리 5종 (§2.3 CATEGORY.code).
 *
 * 카테고리는 고정 5종이라 admin 에 만드는 화면이 없다. 대신 로그인 뒤 서버 목록에
 * 빠진 코드가 있으면 이 이름표로 만든다 — 장소는 존재하는 category_id 가 있어야 생긴다.
 * 이름을 바꾸려면 여기가 아니라 서버 데이터를 고쳐야 한다(이미 있으면 다시 만들지 않는다).
 */
export const CATEGORY_SEED: CategoryWrite[] = [
  {
    code: 'PUB',
    translations: [
      { language_code: 'KO', name: '주점' },
      { language_code: 'EN', name: 'Pub' },
      { language_code: 'CHN', name: '酒馆' },
    ],
  },
  {
    code: 'BOOTH',
    translations: [
      { language_code: 'KO', name: '부스' },
      { language_code: 'EN', name: 'Booth' },
      { language_code: 'CHN', name: '摊位' },
    ],
  },
  {
    code: 'FOODTRUCK',
    translations: [
      { language_code: 'KO', name: '푸드트럭' },
      { language_code: 'EN', name: 'Food Truck' },
      { language_code: 'CHN', name: '餐车' },
    ],
  },
  {
    code: 'MEDI',
    translations: [
      { language_code: 'KO', name: '의무실' },
      { language_code: 'EN', name: 'First Aid' },
      { language_code: 'CHN', name: '医务室' },
    ],
  },
]
