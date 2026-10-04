import type { MapPlace } from './map-place'

// 대소문자·띄어쓰기·문장부호·기호를 무시해 "영eng업중"으로 쳐도 "영(ENG)업중 :"이, 아이폰이 바꾼 ’ 로 쳐도 ' 가 걸리게 한다
function normalize(text: string | null): string {
  return (text ?? '').toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, '')
}

// 작을수록 앞. 이름이 검색어로 시작 → 이름에 포함 → 운영에 포함 순이고, 안 걸리면 null
function rankOf(place: MapPlace, query: string): number | null {
  const name = normalize(place.name)
  if (name.startsWith(query)) return 0
  if (name.includes(query)) return 1
  if (normalize(place.host_college).includes(query)) return 2
  return null
}

/** 이름·운영에 검색어가 걸린 장소. 걸린 정도가 같으면 지도 목록 순서를 지킨다 */
export function searchPlaces(places: MapPlace[], query: string): MapPlace[] {
  const normalized = normalize(query)
  if (!normalized) return []
  return places
    .flatMap((place) => {
      const rank = rankOf(place, normalized)
      return rank === null ? [] : [{ place, rank }]
    })
    .sort((a, b) => a.rank - b.rank)
    .map(({ place }) => place)
}
