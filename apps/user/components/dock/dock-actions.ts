import { DOCK_TABS } from './dock-mode'

/** 맨 위로 부드럽게 올린다 */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/** 앱 안에 이전 페이지가 있는지. 링크로 바로 들어왔으면 뒤로 가기가 사이트를 떠난다 */
export function canGoBackInApp() {
  // Navigation API 의 기록은 같은 출처만 담아서 바깥 사이트는 false 가 된다
  return window.navigation?.canGoBack ?? false
}

/** 이전 페이지가 없을 때 갈 곳. 상세의 상위 탭, 없으면 홈 */
export function backFallback(pathname: string) {
  const parent = pathname.slice(0, pathname.lastIndexOf('/')) || '/'
  return DOCK_TABS.some((tab) => tab.href === parent) ? parent : '/'
}
