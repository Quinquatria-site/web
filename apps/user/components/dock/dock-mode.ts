/** 도크 모양: 없음 · 위로 가기 원 · 탭바 · 뒤로 가기 원 */
export type DockMode = 'hidden' | 'top' | 'tabs' | 'back'

/** 탭바에 놓이는 메인 탭. 여기 있는 주소만 tabs 모드가 된다 */
export const DOCK_TABS = [
  { href: '/', label: '홈' },
  { href: '/timeline', label: '일정표' },
  { href: '/map', label: '지도' },
  { href: '/notices', label: '공지' },
  { href: '/lost-items', label: '분실물' },
  { href: '/goods', label: '굿즈' },
] as const

/** 주소와 랜딩 통과 여부로 도크 모드를 정한다 */
export function getDockMode(pathname: string, pastLanding: boolean): DockMode {
  if (pathname === '/') return pastLanding ? 'top' : 'hidden'
  if (DOCK_TABS.some((tab) => tab.href === pathname)) return 'tabs'
  // 메인 탭이 아닌 주소는 전부 상세로 보고 뒤로 가기를 준다
  return 'back'
}
