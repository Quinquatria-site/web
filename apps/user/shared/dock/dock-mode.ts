/** 도크 모양: 없음 · 위로 가기 원 · 탭바 · 뒤로 가기 원 */
export type DockMode = 'hidden' | 'top' | 'tabs' | 'back'

/** 탭바에 놓이는 메인 탭. href 는 언어를 뺀 경로이고, 여기 있는 경로만 tabs 모드가 된다 */
export const DOCK_TABS = [
  { id: 'home', href: '/' },
  { id: 'schedule', href: '/schedule' },
  { id: 'map', href: '/map' },
  { id: 'notices', href: '/notices' },
  { id: 'lostItems', href: '/lost-items' },
  { id: 'goods', href: '/goods' },
] as const

/** 언어를 뺀 경로와 랜딩 통과 여부로 도크 모드를 정한다 */
export function getDockMode(path: string, pastLanding: boolean): DockMode {
  if (path === '/') return pastLanding ? 'top' : 'hidden'
  if (DOCK_TABS.some((tab) => tab.href === path)) return 'tabs'
  // 메인 탭이 아닌 주소는 전부 상세로 보고 뒤로 가기를 준다
  return 'back'
}
