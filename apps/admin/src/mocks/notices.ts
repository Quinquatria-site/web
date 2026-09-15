import type { LanguageCode, Notice, NoticeTranslation, NoticeType } from './types'

/**
 * 공지 목 (§5.7). 실 문안은 아직 없다 — 총학생회가 축제 직전에 쓴다.
 * 그래서 장소·공연 목과 같은 관례로 세 언어 대괄호 자리표시자다.
 *
 * created_at 은 전부 **오늘보다 과거**다. 서버가 찍는 생성 시각이라 미래일 수
 * 없고, 축제 일자(10/6~7)로 적으면 개발 중 새로 만든 공지가 목 아래로 깔려
 * 정렬이 고장난 것처럼 보인다. 공지는 원래 축제 전부터 올라온다.
 *
 * 화면이 지켜야 할 규칙이 실제로 보이도록 일부러 섞어 둔다.
 * - 상시·일반 두 종류 (§2.3). 목록이 두 섹션으로 갈린다
 * - 같은 시각 2건 (301·302) — created_at DESC 다음의 id DESC 까지 확인된다
 * - KO 단독 2건, CHN 만 빠진 1건 — 배지가 여러 언어일 때와 한 언어일 때를 모두 본다.
 *   상시에도 하나 두는데, 축제 내내 걸려 있는 안내라 누락의 대가가 가장 크다 (§2.4)
 *
 * 배열 순서는 의미가 없다. 목록은 스토어가 정렬해 내보낸다.
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

/**
 * langs 를 주면 그 언어만 번역을 만든다. 공연 목의 koOnly 와 달리 목록을 받는
 * 이유는 "CHN 만 빠진" 경우도 필요해서다 — 배지가 한 언어만 말할 때의 모양이
 * 다르다.
 */
function build(
  id: number,
  type: NoticeType,
  createdAt: string,
  title: Localized,
  content: Localized,
  options: { langs?: LanguageCode[] } = {},
): Notice {
  const { langs } = options
  const pairs = langs ? LANG_ORDER.filter(([, code]) => langs.includes(code)) : LANG_ORDER
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
    '2026-09-08T10:00:00+09:00',
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
    '2026-09-08T10:00:00+09:00',
    { ko: '[분실물 센터 위치]', en: '[Lost and Found]', cha: '[失物招领处]' },
    {
      ko: '[학생회관 1층 로비에서 운영합니다.]',
      en: '[Open in the Student Union lobby, 1F.]',
      cha: '[设在学生会馆一楼大厅。]',
    },
  ),
  // 상시인데 한국어뿐이다. 하필 안전·의료 안내라 축제 내내 외국인 학생에게는
  // 이 정보가 없는 것과 같다 (§2.4). 목에서 가장 나쁜 경우를 하나 남겨둔다
  build(
    303,
    'PERMANENT',
    '2026-09-09T14:20:00+09:00',
    { ko: '[의무실 운영 안내]', en: '', cha: '' },
    { ko: '[의무실은 운동장 본부석 옆에 있습니다.]', en: '', cha: '' },
    { langs: ['KO'] },
  ),

  // 일반 — 준비 기간부터 그때그때 올라온다
  // CHN 만 빠졌다. 배지가 한 언어만 말할 때의 모양을 확인한다
  build(
    401,
    'GENERAL',
    '2026-09-10T09:20:00+09:00',
    { ko: '[주차 안내]', en: '[Parking]', cha: '' },
    {
      ko: '[축제 기간 교내 주차가 제한됩니다.]',
      en: '[Campus parking is limited during the festival.]',
      cha: '',
    },
    { langs: ['KO', 'EN'] },
  ),
  // 급하게 올린 한국어 단독 공지. 현장에서 가장 흔한 누락 경로다
  build(
    402,
    'GENERAL',
    '2026-09-12T13:45:00+09:00',
    { ko: '[팔찌 사전 수령 안내]', en: '', cha: '' },
    { ko: '[학생증을 지참해 학생회관에서 수령하세요.]', en: '', cha: '' },
    { langs: ['KO'] },
  ),
  build(
    403,
    'GENERAL',
    '2026-09-14T16:10:00+09:00',
    { ko: '[우천 시 무대 운영 안내]', en: '[Stage Operations in Rain]', cha: '[雨天舞台运营通知]' },
    {
      ko: '[비가 오면 야외 무대는 학생회관 대강당으로 옮깁니다.]',
      en: '[If it rains, the outdoor stage moves to the Student Union auditorium.]',
      cha: '[如遇降雨，露天舞台将移至学生会馆大礼堂。]',
    },
  ),
]
