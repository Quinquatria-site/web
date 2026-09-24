import type { LanguageCode, Performance, PerformanceTranslation, PerformanceType } from './types'

/**
 * 공연 라인업 목 (§5.6). 실 라인업은 아직 없다 — PRD §7-2 의 블로커다.
 *
 * **초청 가수 이름은 지어낸 것이다.** 실제로 섭외된 팀이 아니다. 그래도 자리표시
 * 대신 이름처럼 보이는 문자열을 넣는 이유는, `[연예인 무대 1]` 로는 목록 행에서
 * 제목이 배지와 부딪히는지도 지도·홈 화면에서 잘리는지도 볼 수 없어서다.
 * 실 라인업이 나오면 이 파일만 갈아끼운다.
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

const DAY1 = '2026-10-07'
const DAY2 = '2026-10-08'

export const PERFORMANCES: Performance[] = [
  build(
    101,
    'STUDENT',
    DAY1,
    1,
    { ko: '개막 선언과 오프닝 무대', en: 'Opening Ceremony', cha: '开幕宣言与开场舞台' },
    {
      ko: '총학생회장의 개막 선언 뒤 응원단이 오프닝 무대를 엽니다. 약 20분간 진행합니다.',
      en: 'The student council president opens the festival, followed by the cheer squad. About twenty minutes.',
      cha: '学生会长宣布开幕，随后由啦啦队带来开场表演。约二十分钟。',
    },
  ),
  build(
    102,
    'SPECIAL',
    DAY1,
    2,
    { ko: '단과대 응원제', en: 'College Cheer Festival', cha: '学院助威节' },
    {
      ko: '단과대 여덟 곳이 순서대로 응원을 겨룹니다. 순위는 학생 투표로 정합니다.',
      en: 'Eight colleges compete in turn. Rankings are decided by student vote.',
      cha: '八个学院依次比拼助威表演。名次由学生投票决定。',
    },
  ),
  // 번역 누락 배지 확인용 — EN·CHN 사용자에게는 이 공연이 목록에서 사라진다 (§2.4)
  build(
    103,
    'STUDENT',
    DAY1,
    3,
    { ko: '공연 동아리 연합 무대', en: '', cha: '' },
    {
      ko: '댄스·아카펠라·연극 동아리가 15분씩 이어서 올라갑니다.',
      en: '',
      cha: '',
    },
    { koOnly: true },
  ),
  build(
    104,
    'ARTIST',
    DAY1,
    4,
    { ko: '블루아워', en: 'Blue Hour', cha: '蓝色时刻' },
    {
      ko: '초청 밴드 공연입니다. 무대 앞 스탠딩 구역은 공연 30분 전부터 엽니다.',
      en: 'Invited band performance. The standing area opens thirty minutes before the set.',
      cha: '特邀乐队演出。舞台前站席于演出前三十分钟开放。',
    },
    { live: true, image: 'images/performance/mock-artist-1.webp' },
  ),

  build(
    201,
    'STUDENT',
    DAY2,
    1,
    { ko: '학과 대항 무대', en: 'Department Showcase', cha: '院系对抗舞台' },
    {
      ko: '학과별로 준비한 무대를 차례로 올립니다. 참가 학과는 열두 곳입니다.',
      en: 'Departments take the stage in turn. Twelve departments are taking part.',
      cha: '各院系依次登台表演。共十二个院系参加。',
    },
  ),
  build(
    202,
    'SPECIAL',
    DAY2,
    2,
    { ko: '교내 가요제 본선', en: 'Campus Song Festival Finals', cha: '校园歌谣节决赛' },
    {
      ko: '예선을 통과한 여섯 팀이 겨룹니다. 심사는 교수진과 학생 심사단이 함께 합니다.',
      en: 'Six teams from the preliminaries compete. Judged by faculty and a student panel.',
      cha: '通过预赛的六支队伍同台竞演。由教授与学生评审团共同评分。',
    },
  ),
  build(
    203,
    'STUDENT',
    DAY2,
    3,
    { ko: '밴드 연합 무대', en: '', cha: '' },
    {
      ko: '교내 밴드 네 팀이 연달아 연주합니다. 마지막 곡은 다 같이 부릅니다.',
      en: '',
      cha: '',
    },
    { koOnly: true },
  ),
  build(
    204,
    'ARTIST',
    DAY2,
    4,
    { ko: '미드나잇 테이프', en: 'Midnight Tape', cha: '午夜磁带' },
    {
      ko: '초청 가수 공연입니다. 우천 시 학생회관 대강당으로 옮겨 진행합니다.',
      en: 'Invited artist performance. Moves to the Student Union auditorium if it rains.',
      cha: '特邀歌手演出。如遇降雨将移至学生会馆大礼堂。',
    },
    { image: 'images/performance/mock-artist-2.webp' },
  ),
  build(
    205,
    'ARTIST',
    DAY2,
    5,
    { ko: '폐막 무대와 불꽃놀이', en: 'Closing Stage and Fireworks', cha: '闭幕舞台与烟花' },
    {
      ko: '마지막 무대가 끝나면 운동장에서 불꽃놀이를 올립니다. 안전선 밖에서 봐 주세요.',
      en: 'Fireworks go up over the field after the final set. Please watch from outside the safety line.',
      cha: '最后一场演出结束后在运动场燃放烟花。请在安全线外观看。',
    },
  ),
]
