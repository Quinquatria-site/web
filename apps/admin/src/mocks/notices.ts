import type { LanguageCode, Notice, NoticeTranslation, NoticeType } from './types'

/**
 * 공지 목 (§5.7). 실 문안은 총학생회가 축제 직전에 쓴다.
 *
 * 자리표시 대신 실제로 적힐 법한 문장을 넣는다. 공지는 제목 한 줄과 본문 몇
 * 문단이 목록·상세에서 어떻게 잘리고 접히는지가 전부라, `[안전 수칙]` 로는
 * 그 판단을 할 수 없다. 문안이 오면 이 파일만 갈아끼운다.
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
    { ko: '축제 기간 안전 수칙', en: 'Festival Safety Guidelines', cha: '节庆期间安全须知' },
    {
      ko: '안전요원의 안내를 반드시 따라 주세요. 무대 앞 스탠딩 구역에서는 밀거나 뛰지 마시고, 몸이 불편하면 가까운 의무실로 이동해 주세요. 주류는 학생증 확인 후에만 제공됩니다.',
      en: 'Please follow the safety staff at all times. Do not push or run in the standing area, and head to the nearest first aid point if you feel unwell. Alcohol is served only after a student ID check.',
      cha: '请务必听从安全人员的指引。站席区内请勿推挤或奔跑，身体不适时请前往最近的医务室。酒类需出示学生证后方可提供。',
    },
  ),
  // 301 과 created_at 이 같다. 2차 키 id DESC 로 이쪽이 위에 온다
  build(
    302,
    'PERMANENT',
    '2026-09-08T10:00:00+09:00',
    { ko: '분실물 센터 운영 안내', en: 'Lost and Found', cha: '失物招领处' },
    {
      ko: '학생회관 1층 로비에서 축제 시간 내내 운영합니다. 물건을 주우셨다면 그 자리에 두지 마시고 센터로 가져다 주세요. 찾아가지 않은 물건은 축제가 끝나고 2주간 보관합니다.',
      en: 'Open in the Student Union lobby, 1F, for the whole festival. If you find something, bring it to the center rather than leaving it. Unclaimed items are kept for two weeks after the festival.',
      cha: '节庆期间全天设于学生会馆一楼大厅。拾获物品请勿留在原地，送至失物招领处。未认领物品在节庆结束后保管两周。',
    },
  ),
  // 상시인데 한국어뿐이다. 하필 안전·의료 안내라 축제 내내 외국인 학생에게는
  // 이 정보가 없는 것과 같다 (§2.4). 목에서 가장 나쁜 경우를 하나 남겨둔다
  build(
    303,
    'PERMANENT',
    '2026-09-09T14:20:00+09:00',
    { ko: '의무실 위치와 운영 시간', en: '', cha: '' },
    {
      ko: '의무실은 세 곳입니다. 대운동장 본부석 옆, 학생회관 1층, C구역 초입에 있으며 축제 시간 내내 간호 인력이 상주합니다. 응급 상황은 119 신고와 함께 가까운 안전요원에게 알려 주세요.',
      en: '',
      cha: '',
    },
    { langs: ['KO'] },
  ),

  // 일반 — 준비 기간부터 그때그때 올라온다
  // CHN 만 빠졌다. 배지가 한 언어만 말할 때의 모양을 확인한다
  build(
    401,
    'GENERAL',
    '2026-09-10T09:20:00+09:00',
    { ko: '축제 기간 교내 주차 제한', en: 'Campus Parking During the Festival', cha: '' },
    {
      ko: '10월 6일부터 7일까지 대운동장 주변 주차장을 닫습니다. 차를 가져오셔야 한다면 정문 옆 임시 주차장을 이용해 주세요. 셔틀버스는 평소대로 운행합니다.',
      en: 'Parking around the main field is closed on October 6 and 7. If you must drive, use the temporary lot beside the main gate. Shuttle buses run on the usual schedule.',
      cha: '',
    },
    { langs: ['KO', 'EN'] },
  ),
  // 급하게 올린 한국어 단독 공지. 현장에서 가장 흔한 누락 경로다
  build(
    402,
    'GENERAL',
    '2026-09-12T13:45:00+09:00',
    { ko: '팔찌 사전 수령 안내', en: '', cha: '' },
    {
      ko: '학생증을 지참해 오바마홀 1층 수령소에서 받아 주세요. 하루에 한 번만 받을 수 있고, 팔찌가 없으면 주점 구역에 들어갈 수 없습니다.',
      en: '',
      cha: '',
    },
    { langs: ['KO'] },
  ),
  build(
    403,
    'GENERAL',
    '2026-09-14T16:10:00+09:00',
    {
      ko: '우천 시 무대 운영 안내',
      en: 'Stage Operations in Case of Rain',
      cha: '雨天舞台运营通知',
    },
    {
      ko: '비가 오면 야외 무대는 학생회관 대강당으로 옮깁니다. 좌석이 절반으로 줄어 선착순으로 들어가게 되며, 변경은 공지와 현장 안내 방송으로 함께 알려드립니다.',
      en: 'If it rains, the outdoor stage moves to the Student Union auditorium. Seating is halved and admission is first come, first served. Changes are announced here and over the PA.',
      cha: '如遇降雨，露天舞台将移至学生会馆大礼堂。座位减半并采先到先入场，变更将通过公告与现场广播同时通知。',
    },
  ),
]
