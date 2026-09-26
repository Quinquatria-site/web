export type DockMode = 'hidden' | 'top' | 'tabs' | 'back'

export const DOCK_TABS = [
  { href: '/', label: '홈' },
  { href: '/performances', label: '공연' },
  { href: '/map', label: '지도' },
  { href: '/notices', label: '공지' },
  { href: '/lost-items', label: '분실물' },
] as const

export function getDockMode(pathname: string, pastLanding: boolean): DockMode {
  if (pathname === '/') return pastLanding ? 'top' : 'hidden'
  if (DOCK_TABS.some((tab) => tab.href === pathname)) return 'tabs'
  return 'back'
}
