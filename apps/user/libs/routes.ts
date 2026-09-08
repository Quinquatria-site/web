export const PAGE_ITEMS = [
  { href: '/timeline', label: '타임라인', summary: '공연과 부스 일정을 시간순으로' },
  { href: '/map', label: '캠퍼스 지도', summary: '부스 · 화장실 · 쓰레기통 위치' },
  { href: '/notice', label: '공지사항', summary: '흩어진 공지를 한 곳에서' },
  { href: '/lost-found', label: '분실물', summary: '잃어버린 물건 찾아가기' },
] as const

export const HOME_ITEM = { href: '/', label: '홈' } as const

export type PageItem = (typeof PAGE_ITEMS)[number]
