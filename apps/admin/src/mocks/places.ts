import { BOOTHS, LAYOUT_PLACES, type Localized } from './layout'
import type { LanguageCode, Place, PlaceTranslation } from './types'

/**
 * layout.ts(user 앱 원본 좌표)를 Backoffice Place 스키마(§5.4)로 변환한다.
 * 좌표는 그대로 흐르고 admin 이 덧붙이는 것은 스키마 껍데기뿐이다 —
 * 운영 시간(user 목에 없어 카테고리 기본값으로 합성)과 자리표시 문구.
 *
 * 쓰레기통(bin)은 변환하지 않는다. ERD 에 카테고리가 없고 PRD §7-4 가
 * 편의시설을 정적 마커로 정했다.
 *
 * 이름은 user 관례대로 세 언어 대괄호 자리표시다. 번역 누락 경고 검증용으로
 * 주점 2 · 부스 A-2 · 푸드트럭 2 세 곳만 일부러 KO 단독으로 남긴다.
 */

/** user 언어 코드(ko/en/cha) → API 명세 §2.3 (KO/EN/CHN) */
const LANG_FROM_LAYOUT: Record<keyof Localized, LanguageCode> = {
  ko: 'KO',
  en: 'EN',
  cha: 'CHN',
}

/** 일부러 KO 만 남길 장소. 경고 UI 가 실제로 뜨는지 보는 용도 */
const KO_ONLY_IDS = new Set(['pub-2', 'A-2', 'food-2'])

let translationId = 9000

function toTranslations(
  placeId: number,
  layoutId: string,
  name: Localized,
  host: Localized,
  description: Localized,
): PlaceTranslation[] {
  const langs: (keyof Localized)[] = KO_ONLY_IDS.has(layoutId) ? ['ko'] : ['cha', 'en', 'ko'] // Backoffice 정렬: language_code ASC (§5.1)
  return langs.map((lang) => {
    translationId += 1
    return {
      id: translationId,
      place_id: placeId,
      language_code: LANG_FROM_LAYOUT[lang],
      name: name[lang],
      host_college: host[lang],
      description: description[lang],
    }
  })
}

/** 카테고리별 기본 운영 시간. user 목에 시간이 없어 합성한다 (10/6 기준) */
const HOURS: Record<number, [string, string]> = {
  1: ['2026-10-06T17:00:00+09:00', '2026-10-06T23:00:00+09:00'], // 주점
  2: ['2026-10-06T10:00:00+09:00', '2026-10-06T17:00:00+09:00'], // 부스
  3: ['2026-10-06T11:00:00+09:00', '2026-10-06T21:00:00+09:00'], // 푸드트럭
  4: ['2026-10-06T09:00:00+09:00', '2026-10-06T23:00:00+09:00'], // 의무실
  5: ['2026-10-06T09:00:00+09:00', '2026-10-06T18:00:00+09:00'], // 팔찌
}

const TBD: Localized = { ko: '[미정]', en: '[TBD]', cha: '[待定]' }

function build(
  id: number,
  categoryId: number,
  sequence: number,
  layoutId: string,
  x: number,
  y: number,
  name: Localized,
  host: Localized = TBD,
  description: Localized = TBD,
): Place {
  const [start, end] = HOURS[categoryId]
  return {
    id,
    category_id: categoryId,
    category_sequence: sequence,
    x,
    y,
    start_hour: start,
    end_hour: end,
    place_image_uri: [],
    translations: toTranslations(id, layoutId, name, host, description),
  }
}

const KIND_TO_CATEGORY: Record<string, number> = { pub: 1, food: 3, aid: 4 }
const KIND_BASE_ID: Record<string, number> = { pub: 9, food: 29, aid: 39 }

const fromLayoutPlaces: Place[] = LAYOUT_PLACES.filter((p) => p.kind !== 'bin').map((p, _, all) => {
  const sequence = all.filter((q) => q.kind === p.kind).indexOf(p) + 1
  return build(
    KIND_BASE_ID[p.kind] + sequence,
    KIND_TO_CATEGORY[p.kind],
    sequence,
    p.id,
    p.x,
    p.y,
    p.name,
  )
})

const fromBooths: Place[] = BOOTHS.map((booth, index) =>
  build(1001 + index, 2, index + 1, booth.id, booth.x, booth.y, {
    ko: `[부스 ${booth.id}]`,
    en: `[Booth ${booth.id}]`,
    cha: `[摊位 ${booth.id}]`,
  }),
)

/** 팔찌 수령소는 user 목에 없다. 오바마홀 한 곳을 admin 쪽에서 유지한다 (PRD §5-3) */
const bracelet = build(50, 5, 1, 'bracelet-1', 100, 150, {
  ko: '[팔찌 수령소 (오바마홀)]',
  en: '[Bracelet Pickup (Obama Hall)]',
  cha: '[手环领取处（奥巴马厅）]',
})

export const PLACES: Place[] = [...fromLayoutPlaces, ...fromBooths, bracelet]
