import { DEFAULT_LOCALE, isLocale, type Locale } from './locales'

/** 언어 없는 앱 안 경로에 언어를 붙인다. 홈 `/` 는 `/ko` 가 된다 */
export function localePath(locale: Locale, path: string) {
  return path === '/' ? `/${locale}` : `/${locale}${path}`
}

/** 주소를 언어와 언어 없는 경로로 나눈다. 탭 판별처럼 언어와 상관없는 비교에 쓴다 */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const [, first = '', ...rest] = pathname.split('/')
  // 언어 칸이 없는 주소는 정적 생성되지 않아 404 로 가지만, 그 화면의 도크도 기본 언어로 그린다
  if (!isLocale(first)) return { locale: DEFAULT_LOCALE, path: pathname }
  return { locale: first, path: `/${rest.join('/')}` }
}
