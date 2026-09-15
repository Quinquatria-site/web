import type { LanguageCode, Notice, NoticeTranslation, NoticeType } from './types'

/**
 * 공지 목 (§5.7). 실 문안은 아직 없다 — 총학생회가 축제 직전에 쓴다.
 * 그래서 장소·공연 목과 같은 관례로 세 언어 대괄호 자리표시자다.
 *
 * 화면이 지켜야 할 규칙이 실제로 보이도록 일부러 섞어 둔다.
 * - 상시·일반 두 종류 (§2.3). 목록이 두 섹션으로 갈린다
 * - created_at DESC, id DESC 정렬 (§5.1). 시각을 흩어 놓고 같은 시각 2건을
 *   넣어 2차 키까지 확인되게 한다
 * - KO 단독 번역 두 건 — 번역 누락 경고 확인용 (§2.4). 상시에도 하나 둔다.
 *   상시 공지는 축제 내내 걸려 있어 누락의 대가가 가장 크다
 *
 * 배열 순서는 의미가 없다. 목록은 스토어가 정렬해 내보낸다.
 *
 * created_at 이 축제 기간(10/5~6)이라 개발 중에 새로 만든 공지는 목록 맨 아래로
 * 간다 — 오늘 날짜가 축제보다 앞서기 때문이다. 정렬이 고장난 게 아니다.
 * 축제 당일에는 지금 시각이 제일 최신이라 새 공지가 맨 위로 올라온다.
 */

interface Localized {
  ko: string
  en: string
  cha: string
}

let translationId = 8000

/** Backoffice 응답 정렬은 language_code ASC 다: CHN → EN → KO (§5.2) */
const LANG_ORDER: [keyof Localized, LanguageCode][] = [
  ['cha', 'CHN'],
  ['en', 'EN'],
  ['ko', 'KO'],
]

function build(
  id: number,
  type: NoticeType,
  createdAt: string,
  title: Localized,
  content: Localized,
  options: { koOnly?: boolean } = {},
): Notice {
  const pairs = options.koOnly ? LANG_ORDER.filter(([, code]) => code === 'KO') : LANG_ORDER
  const translations: NoticeTranslation[] = pairs.map(([key, code]) => {
    translationId += 1
    return {
      id: translationId,
      notice_id: id,
      language_code: code,
      title: title[key],
      content: content[key],
    }
  })

  return { id, type, created_at: createdAt, translations }
}

export const NOTICES: Notice[] = [
  // 상시 — 축제 전에 걸어두고 내내 유지한다
  build(
    301,
    'PERMANENT',
    '2026-10-05T09:00:00+09:00',
    { ko: '[안전 수칙]', en: '[Safety Guidelines]', cha: '[安全须知]' },
    {
      ko: '[안전요원의 안내를 따라 주세요.]',
      en: "[Please follow the safety staff's instructions.]",
      cha: '[请遵循安全人员的指引。]',
    },
  ),
  // 301 과 created_at 이 같다. 2차 키 id DESC 로 이쪽이 위에 온다
  build(
    302,
    'PERMANENT',
    '2026-10-05T09:00:00+09:00',
    { ko: '[분실물 센터 위치]', en: '[Lost and Found]', cha: '[失物招领处]' },
    {
      ko: '[학생회관 1층 로비에서 운영합니다.]',
      en: '[Open in the Student Union lobby, 1F.]',
      cha: '[设在学生会馆一楼大厅。]',
    },
  ),
  // 상시인데 한국어뿐이다. 축제 내내 외국인 학생에게는 이 안내가 없는 것과 같다 (§2.4)
  build(
    303,
    'PERMANENT',
    '2026-10-05T10:30:00+09:00',
    { ko: '[의무실 운영 안내]', en: '', cha: '' },
    { ko: '[의무실은 운동장 본부석 옆에 있습니다.]', en: '', cha: '' },
    { koOnly: true },
  ),

  // 일반 — 축제 당일 그때그때 올라온다
  build(
    401,
    'GENERAL',
    '2026-10-06T09:20:00+09:00',
    { ko: '[주차 안내]', en: '[Parking]', cha: '[停车须知]' },
    {
      ko: '[축제 기간 교내 주차가 제한됩니다.]',
      en: '[Campus parking is limited during the festival.]',
      cha: '[庆典期间校内停车受限。]',
    },
  ),
  // 급하게 올린 한국어 단독 공지. 현장에서 가장 흔한 누락 경로다
  build(
    402,
    'GENERAL',
    '2026-10-06T13:45:00+09:00',
    { ko: '[공연 시간 지연]', en: '', cha: '' },
    { ko: '[오후 공연이 30분씩 밀렸습니다.]', en: '', cha: '' },
    { koOnly: true },
  ),
  build(
    403,
    'GENERAL',
    '2026-10-06T16:10:00+09:00',
    { ko: '[우천 시 무대 운영 안내]', en: '[Stage Operations in Rain]', cha: '[雨天舞台运营通知]' },
    {
      ko: '[비가 오면 야외 무대는 학생회관 대강당으로 옮깁니다.]',
      en: '[If it rains, the outdoor stage moves to the Student Union auditorium.]',
      cha: '[如遇降雨，露天舞台将移至学生会馆大礼堂。]',
    },
  ),
]
