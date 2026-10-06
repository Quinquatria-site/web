/**
 * 학생 앱 주소 → 사람이 읽는 페이지 이름. 방문 통계가 `/en/notices/12` 같은
 * 원시 경로를 "공지 상세" 로 묶는 데 쓴다.
 *
 * **두 벌이다.** 원본은 학생 앱의 `apps/user/app/[lang]/**` 라우트와
 * `apps/user/shared/i18n/messages/ko.ts` 의 `pages`·`dock.tabs` 문구다. 앱이
 * 달라 import 할 수 없어 여기 옮겨 적었다. 학생 앱에 페이지가 생기거나 이름이
 * 바뀌면 여기도 고친다 — 안 고치면 그 페이지는 "기타" 로 조용히 묶인다.
 */

/** apps/user/shared/i18n/locales.ts 의 LOCALES 와 같은 순서 */
export const STUDENT_LOCALES = ['ko', 'en', 'zh'] as const
export type StudentLocale = (typeof STUDENT_LOCALES)[number]

export const STUDENT_LOCALE_LABEL: Record<StudentLocale, string> = {
  ko: '한국어',
  en: 'English',
  zh: '中文',
}

/** 언어를 뗀 첫 세그먼트 → [목록 이름, 상세 이름]. 상세가 없는 페이지는 하나만 */
const PAGES: Record<string, readonly [string, string?]> = {
  '': ['홈'],
  schedule: ['축제 일정표'],
  map: ['지도', '장소 상세'],
  notices: ['공지', '공지 상세'],
  'lost-items': ['분실물 찾기', '분실물 상세'],
  goods: ['굿즈'],
  online: ['온라인 콘텐츠'],
  developers: ['개발진 소개'],
  // /admin 같은 관리자 주소를 쳐 보면 학생 앱이 여기로 보낸다. 통계엔 원래 주소가 안 남는다
  focus: ['/ko/focus (/admin 등 접속 시도)'],
}

export const OTHER_PAGE = '기타'

/**
 * 경로를 언어와 페이지 이름으로 나눈다. 언어 접두어가 없으면 학생 앱의
 * splitLocale 과 같이 기본 언어(ko)로 본다 — `/` 는 `/ko` 로 리다이렉트된다.
 */
export function describeStudentPath(path: string): {
  locale: StudentLocale
  page: string
  /** 상세 페이지의 글·장소 번호. 상세가 아니면 null */
  id: string | null
} {
  const segments = path.split('?')[0].split('/').filter(Boolean)
  const locale = STUDENT_LOCALES.find((code) => code === segments[0])
  const rest = locale ? segments.slice(1) : segments
  const names = PAGES[rest[0] ?? '']

  let page = OTHER_PAGE
  let id: string | null = null
  if (names && rest.length <= 1) page = names[0]
  else if (names?.[1] && rest.length === 2) {
    page = names[1]
    id = rest[1]
  }

  return { locale: locale ?? 'ko', page, id }
}
