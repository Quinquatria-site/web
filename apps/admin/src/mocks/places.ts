import { BOOTHS, LAYOUT_PLACES, type Localized } from './layout'
import { BOOTH_INFO, PLACE_INFO } from './placeNames'
import type { LanguageCode, Place, PlaceTranslation } from './types'

/**
 * layout.ts(user 앱 원본 좌표)를 Backoffice Place 스키마(§5.4)로 변환한다.
 * 좌표는 그대로 흐르고 admin 이 덧붙이는 것은 스키마 껍데기뿐이다 —
 * 운영 시간(user 목에 없어 카테고리 기본값으로 합성)과 자리표시 문구.
 *
 * 쓰레기통(bin)은 변환하지 않는다. ERD 에 카테고리가 없고 PRD §7-4 가
 * 편의시설을 정적 마커로 정했다.
 *
 * 이름·주최·설명은 placeNames.ts 에서 온다. layout.ts 의 자리표시 문구를 덮는
 * 것이라 좌표 원본은 손대지 않는다. 번역 누락 경고 검증용으로 주점 2 ·
 * 부스 A-2 · 푸드트럭 2 세 곳만 일부러 KO 단독으로 남긴다.
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

/** 카테고리별 기본 운영 시간. user 목에 시간이 없어 합성한다 (10/7 기준) */
const HOURS: Record<number, [string, string]> = {
  1: ['2026-10-07T17:00:00+09:00', '2026-10-07T23:00:00+09:00'], // 주점
  2: ['2026-10-07T10:00:00+09:00', '2026-10-07T17:00:00+09:00'], // 부스
  3: ['2026-10-07T11:00:00+09:00', '2026-10-07T21:00:00+09:00'], // 푸드트럭
  4: ['2026-10-07T09:00:00+09:00', '2026-10-07T23:00:00+09:00'], // 의무실
  5: ['2026-10-07T09:00:00+09:00', '2026-10-07T18:00:00+09:00'], // 팔찌
}

/** 사진이 없는 게 정상인 시설. 의무실·팔찌 수령소는 null 로 남긴다 */
const PHOTOLESS_CATEGORIES = new Set([4, 5])

/**
 * 목 사진 key. 업로드 플로우(#14) 전까지 화면 모양을 보려고 채운다.
 *
 * 값은 명세대로 S3 key 꼴이다 — 경로가 아니다. 주소로 바꾸는 일은 lib/imageSrc 가
 * 맡는다. 장수를 섞어 배열이 여러 장을 담는다는 것이 화면에서 보이게 한다.
 */
function mockImages(id: number, categoryId: number): string[] | null {
  if (PHOTOLESS_CATEGORIES.has(categoryId)) return null
  const count = (id % 3) + 1
  return Array.from({ length: count }, (_, i) => `images/place/mock-${id}-${i + 1}.webp`)
}

function build(
  id: number,
  categoryId: number,
  sequence: number,
  layoutId: string,
  x: number,
  y: number,
  name: Localized,
  host: Localized,
  description: Localized,
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
    place_image_uri: mockImages(id, categoryId),
    translations: toTranslations(id, layoutId, name, host, description),
  }
}

const KIND_TO_CATEGORY: Record<string, number> = { pub: 1, food: 3, aid: 4 }
const KIND_BASE_ID: Record<string, number> = { pub: 9, food: 29, aid: 39 }

const fromLayoutPlaces: Place[] = LAYOUT_PLACES.filter((p) => p.kind !== 'bin').map((p, _, all) => {
  const sequence = all.filter((q) => q.kind === p.kind).indexOf(p) + 1
  const named = PLACE_INFO[p.id]
  return build(
    KIND_BASE_ID[p.kind] + sequence,
    KIND_TO_CATEGORY[p.kind],
    sequence,
    p.id,
    p.x,
    p.y,
    named.name,
    named.host,
    named.description,
  )
})

const fromBooths: Place[] = BOOTHS.map((booth, index) => {
  const named = BOOTH_INFO[booth.id]
  return build(
    1001 + index,
    2,
    index + 1,
    booth.id,
    booth.x,
    booth.y,
    named.name,
    named.host,
    named.description,
  )
})

/** 팔찌 수령소는 user 목에 없다. 오바마홀 한 곳을 admin 쪽에서 유지한다 (PRD §5-3) */
const braceletInfo = PLACE_INFO['bracelet-1']
const bracelet = build(
  50,
  5,
  1,
  'bracelet-1',
  100,
  150,
  braceletInfo.name,
  braceletInfo.host,
  braceletInfo.description,
)

export const PLACES: Place[] = [...fromLayoutPlaces, ...fromBooths, bracelet]
