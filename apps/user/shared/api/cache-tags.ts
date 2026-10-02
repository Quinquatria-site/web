/** 재검증 태그. Customer API 리소스마다 하나씩 두고, 가져올 때 붙이고 재검증 입구가 같은 이름으로 비운다 */
export const CACHE_TAGS = {
  categories: 'categories',
  // 메뉴는 장소 상세에 딸려 오므로 메뉴가 바뀌어도 places 를 비운다
  places: 'places',
  performances: 'performances',
  // 일반 · 상단 고정 · 최신 공지를 모두 이 하나로 비운다
  notices: 'notices',
  lostItems: 'lost-items',
} as const
