import type { LanguageCode, LostItem, LostItemTranslation } from './types'

/**
 * 분실물 목 (§5.8). 공지 목과 달리 대괄호 자리표시자를 쓰지 않는다 — 분실물
 * 문안은 총학생회가 미리 쓰는 글이 아니라 운영자가 그때그때 적는 것이라,
 * 실제로 적힐 법한 문장이 들어 있어야 행의 길이와 줄바꿈을 판단할 수 있다.
 *
 * created_at 은 전부 **오늘보다 과거**다. 서버가 찍는 생성 시각이라 미래일 수
 * 없고, 축제 일자(10/7~8)로 적으면 개발 중 새로 등록한 분실물이 목 아래로
 * 깔려 정렬이 고장난 것처럼 보인다. 실제 축제 당일에는 지금 시각이 늘 제일
 * 최신이라 새 항목이 맨 위로 올라온다 — 목에서만 시각을 당겨 둔 것이다.
 *
 * 화면이 지켜야 할 규칙이 실제로 보이도록 일부러 섞어 둔다.
 * - 미반환 4 / 반환완료 2 — 두 세그먼트 모두 비어 있지 않다
 * - 같은 시각 2건 (501·502) — created_at DESC 다음의 id DESC 까지 확인된다
 * - KO 단독 2건, CHN 만 빠진 1건 — 누락 배지가 여러 언어일 때와 한 언어일 때를
 *   모두 본다. 분실물은 유학생이 잃어버린 물건일수록 번역 누락의 대가가 크다 (§2.4)
 * - 제목이 긴 건 하나 — 목록 행에서 반환 버튼과 부딪히는지 본다
 *
 * 배열 순서는 의미가 없다. 목록은 스토어가 정렬해 내보낸다.
 */

interface Localized {
  ko: string
  en: string
  cha: string
}

let translationId = 9000

/** Backoffice 응답 정렬은 language_code ASC 다: CHN → EN → KO (§5.2) */
const LANG_ORDER: [keyof Localized, LanguageCode][] = [
  ['cha', 'CHN'],
  ['en', 'EN'],
  ['ko', 'KO'],
]

/** langs 를 주면 그 언어만 번역을 만든다. 공지 목의 build 와 같은 관례다 */
function build(
  id: number,
  createdAt: string,
  isReturned: boolean,
  imageUrl: string,
  title: Localized,
  description: Localized,
  foundLocation: Localized,
  options: { langs?: LanguageCode[] } = {},
): LostItem {
  const { langs } = options
  const pairs = langs ? LANG_ORDER.filter(([, code]) => langs.includes(code)) : LANG_ORDER
  const translations: LostItemTranslation[] = pairs.map(([key, code]) => {
    translationId += 1
    return {
      id: translationId,
      lost_item_id: id,
      language_code: code,
      title: title[key],
      description: description[key],
      found_location: foundLocation[key],
    }
  })

  return {
    id,
    image_url: imageUrl,
    is_returned: isReturned,
    created_at: createdAt,
    translations,
  }
}

export const LOST_ITEMS: LostItem[] = [
  // 501·502 는 시각이 같다. 2차 키(id DESC)가 없으면 순서가 흔들린다
  build(
    501,
    '2026-09-14T18:30:00+09:00',
    false,
    'images/lost/mock-earbuds.webp',
    { ko: '흰색 무선 이어폰', en: 'White wireless earbuds', cha: '白色无线耳机' },
    {
      ko: '케이스에 파란색 스티커가 붙어 있습니다.',
      en: 'The case has a blue sticker on it.',
      cha: '耳机盒上贴有蓝色贴纸。',
    },
    { ko: '정문 앞 벤치', en: 'Bench by the main gate', cha: '正门前长椅' },
  ),
  build(
    502,
    '2026-09-14T18:30:00+09:00',
    false,
    'images/lost/mock-umbrella.webp',
    { ko: '검정 장우산', en: 'Black long umbrella', cha: '黑色长柄伞' },
    { ko: '손잡이가 나무입니다.', en: 'It has a wooden handle.', cha: '手柄为木质。' },
    { ko: '학생회관 1층 출입구', en: 'Student Union 1F entrance', cha: '学生会馆一楼入口' },
  ),

  // 제목이 긴 건. 목록 행에서 반환 버튼과 부딪히는지 본다
  build(
    503,
    '2026-09-14T15:05:00+09:00',
    false,
    'images/lost/mock-tumbler.webp',
    {
      ko: '스테인리스 텀블러 (회색, 뚜껑 없음)',
      en: 'Stainless steel tumbler (grey, no lid)',
      cha: '不锈钢保温杯（灰色，无盖）',
    },
    {
      ko: '바닥에 이름이 새겨져 있습니다.',
      en: 'A name is engraved on the bottom.',
      cha: '杯底刻有名字。',
    },
    { ko: '푸드트럭 구역 C', en: 'Food truck zone C', cha: '餐车区 C' },
  ),

  // CHN 만 빠진 건 — 배지가 한 언어만 말할 때의 모양
  build(
    504,
    '2026-09-13T20:40:00+09:00',
    false,
    'images/lost/mock-powerbank.webp',
    { ko: '보조배터리', en: 'Power bank', cha: '' },
    { ko: '검정색, 케이블이 함께 있습니다.', en: 'Black, with a cable attached.', cha: '' },
    { ko: '대운동장 무대 뒤', en: 'Behind the main stage', cha: '' },
    { langs: ['KO', 'EN'] },
  ),

  // 반환완료 2건. 세그먼트를 옮겨도 목록이 비지 않는다
  build(
    505,
    '2026-09-13T13:20:00+09:00',
    true,
    'images/lost/mock-cardigan.webp',
    { ko: '베이지색 가디건', en: 'Beige cardigan', cha: '米色开衫' },
    { ko: '의자에 걸려 있었습니다.', en: 'It was left hanging on a chair.', cha: '挂在椅子上。' },
    { ko: '통번역대학 주점', en: 'Interpretation College pub', cha: '翻译学院酒馆' },
  ),
  build(
    506,
    '2026-09-12T11:00:00+09:00',
    true,
    'images/lost/mock-keyring.webp',
    { ko: '토끼 열쇠고리', en: '', cha: '' },
    { ko: '열쇠 두 개가 함께 달려 있습니다.', en: '', cha: '' },
    { ko: '분수대 근처', en: '', cha: '' },
    { langs: ['KO'] },
  ),
]
