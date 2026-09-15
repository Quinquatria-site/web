import type { LanguageCode, Performance, PerformanceTranslation, PerformanceType } from './types'

/**
 * 공연 라인업 목 (§5.6). 실 라인업은 아직 없다 — PRD §7-2 의 블로커다.
 * 그래서 이름은 장소 목과 같은 관례로 세 언어 대괄호 자리표시다.
 *
 * 화면이 지켜야 할 규칙이 실제로 보이도록 일부러 섞어 둔다.
 * - 일차마다 seq 는 1부터 빈틈 없이 연속 (§5.6 불변식)
 * - is_live 는 전체에서 정확히 1건
 * - SPECIAL 두 건(응원제·가요제 자리) — 목록 강조 확인용
 * - KO 단독 번역 두 건 — 번역 누락 배지 확인용 (§2.4)
 */

interface Localized {
  ko: string
  en: string
  cha: string
}

let translationId = 7000

/** Backoffice 응답 정렬은 language_code ASC 다: CHN → EN → KO (§5.2) */
const LANG_ORDER: [keyof Localized, LanguageCode][] = [
  ['cha', 'CHN'],
  ['en', 'EN'],
  ['ko', 'KO'],
]

function build(
  id: number,
  type: PerformanceType,
  date: string,
  seq: number,
  title: Localized,
  description: Localized,
  options: { live?: boolean; koOnly?: boolean; image?: string } = {},
): Performance {
  const pairs = options.koOnly ? LANG_ORDER.filter(([, code]) => code === 'KO') : LANG_ORDER
  const translations: PerformanceTranslation[] = pairs.map(([key, code]) => {
    translationId += 1
    return {
      id: translationId,
      performance_id: id,
      language_code: code,
      title: title[key],
      description: description[key],
    }
  })

  return {
    id,
    type,
    image_uri: options.image ?? null,
    date,
    seq,
    is_live: options.live ?? false,
    translations,
  }
}

const TBD: Localized = { ko: '[미정]', en: '[TBD]', cha: '[待定]' }

const DAY1 = '2026-10-06'
const DAY2 = '2026-10-07'

export const PERFORMANCES: Performance[] = [
  build(
    101,
    'STUDENT',
    DAY1,
    1,
    { ko: '[개막 무대]', en: '[Opening Stage]', cha: '[开幕舞台]' },
    {
      ko: '[학생회 개막 공연입니다.]',
      en: '[Opening stage by the student council.]',
      cha: '[学生会开幕演出。]',
    },
  ),
  build(
    102,
    'SPECIAL',
    DAY1,
    2,
    { ko: '[응원제]', en: '[Cheering Festival]', cha: '[助威节]' },
    {
      ko: '[단과대 응원단 합동 무대입니다.]',
      en: '[Joint stage by college cheering squads.]',
      cha: '[各学院助威团联合舞台。]',
    },
  ),
  // 번역 누락 배지 확인용 — EN·CHN 사용자에게는 이 공연이 목록에서 사라진다 (§2.4)
  build(
    103,
    'STUDENT',
    DAY1,
    3,
    { ko: '[동아리 연합 공연]', en: '', cha: '' },
    { ko: '[교내 공연 동아리 합동 무대입니다.]', en: '', cha: '' },
    { koOnly: true },
  ),
  build(
    104,
    'ARTIST',
    DAY1,
    4,
    { ko: '[연예인 무대 1]', en: '[Guest Artist 1]', cha: '[特邀艺人 1]' },
    { ko: '[연예인 초청 무대입니다.]', en: '[Guest artist stage.]', cha: '[特邀艺人舞台。]' },
    { live: true, image: 'images/performance/mock-artist-1.webp' },
  ),

  build(
    201,
    'STUDENT',
    DAY2,
    1,
    { ko: '[학과 공연]', en: '[Department Stage]', cha: '[院系演出]' },
    TBD,
  ),
  build(
    202,
    'SPECIAL',
    DAY2,
    2,
    { ko: '[가요제]', en: '[Song Festival]', cha: '[歌谣节]' },
    {
      ko: '[학생 가요제 본선 무대입니다.]',
      en: '[Finals of the student song festival.]',
      cha: '[学生歌谣节决赛舞台。]',
    },
  ),
  build(
    203,
    'STUDENT',
    DAY2,
    3,
    { ko: '[밴드 공연]', en: '', cha: '' },
    { ko: '[교내 밴드 연합 무대입니다.]', en: '', cha: '' },
    { koOnly: true },
  ),
  build(
    204,
    'ARTIST',
    DAY2,
    4,
    { ko: '[연예인 무대 2]', en: '[Guest Artist 2]', cha: '[特邀艺人 2]' },
    TBD,
    { image: 'images/performance/mock-artist-2.webp' },
  ),
  build(
    205,
    'ARTIST',
    DAY2,
    5,
    { ko: '[폐막 무대]', en: '[Closing Stage]', cha: '[闭幕舞台]' },
    TBD,
  ),
]
