import type { MapPlace } from './map-place'

/** 검색용으로 접은 글자. from · to 는 접은 글자 하나하나가 온 원문(text) 구간이다 */
type Folded = { text: string; folded: string; from: number[]; to: number[] }

/** 검색어를 접은 것. whole 은 띄어쓰기를 무시한 통째, words 는 띄어 쓴 낱말들이다 */
export type SearchQuery = { whole: string; words: string[] }

/** 이름 · 운영을 미리 접어 둔 장소. 번역된 장소는 한국어 원문도 함께 둔다 */
export type SearchablePlace = { place: MapPlace; names: string[]; hosts: string[] }

// 대소문자 · 전각 · 악센트 · 띄어쓰기 · 문장부호 · 기호를 무시해 "kpop"이 "K-Pop"에, "cafe"가 "Café"에, 아이폰이 바꾼 ’ 가 ' 에 걸리게 한다
function foldChar(char: string): string {
  return char
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]/gu, '')
}

// 글자 단위로 접어야 걸린 자리를 원문에 되짚을 수 있다. 붙여 넣은 NFD 한글은 먼저 완성형으로 모아 둬야 글자 단위로 접어도 맞는다
function fold(raw: string): Folded {
  const text = raw.normalize('NFC')
  let folded = ''
  const from: number[] = []
  const to: number[] = []
  let index = 0
  for (const char of text) {
    const piece = foldChar(char)
    folded += piece
    for (let i = 0; i < piece.length; i++) {
      from.push(index)
      to.push(index + char.length)
    }
    index += char.length
  }
  return { text, folded, from, to }
}

function foldAll(texts: (string | null | undefined)[]): string[] {
  return texts.flatMap((text) => (text ? [fold(text).folded] : []))
}

/** 친 글자를 검색어로 */
export function toQuery(raw: string): SearchQuery {
  const words = raw
    .split(/\s+/)
    .map((word) => fold(word).folded)
    .filter(Boolean)
  return { whole: words.join(''), words }
}

/** 장소 목록을 검색할 수 있게 한 번 접어 둔다. 칠 때마다 접지 않으려는 것이다 */
export function toSearchable(places: MapPlace[]): SearchablePlace[] {
  return places.map((place) => ({
    place,
    names: foldAll([place.name, place.source?.name]),
    hosts: foldAll([place.host_college, place.source?.host_college]),
  }))
}

// 작을수록 앞. 이름이 검색어로 시작 → 이름에 포함 → 운영에 포함 → 낱말마다 어딘가에 포함 순이고, 안 걸리면 null
function rankOf({ names, hosts }: SearchablePlace, { whole, words }: SearchQuery): number | null {
  if (names.some((name) => name.startsWith(whole))) return 0
  if (names.some((name) => name.includes(whole))) return 1
  if (hosts.some((host) => host.includes(whole))) return 2
  // 낱말 순서가 다르거나 사이 낱말을 빼먹은 경우라 통째로 걸린 것보다 뒤에 둔다
  const fields = [...names, ...hosts]
  if (words.length > 1 && words.every((word) => fields.some((field) => field.includes(word)))) {
    return 3
  }
  return null
}

/** 이름 · 운영에 검색어가 걸린 장소. 걸린 정도가 같으면 지도 목록 순서를 지킨다 */
export function searchPlaces(places: SearchablePlace[], query: SearchQuery): MapPlace[] {
  if (!query.whole) return []
  return places
    .flatMap((searchable) => {
      const rank = rankOf(searchable, query)
      return rank === null ? [] : [{ place: searchable.place, rank }]
    })
    .sort((a, b) => a.rank - b.rank)
    .map(({ place }) => place)
}

/** 원문에서 검색어가 걸린 구간들. 통째로 걸리면 그 첫 자리, 아니면 낱말마다 첫 자리를 겹치지 않게 합쳐 준다. text 는 구간이 가리키는 원문이다 */
export function matchRanges(
  raw: string,
  { whole, words }: SearchQuery,
): { text: string; ranges: [number, number][] } {
  const { text, folded, from, to } = fold(raw)
  const needles = folded.includes(whole) ? [whole] : words
  const ranges = needles
    .flatMap((needle): [number, number][] => {
      const at = needle ? folded.indexOf(needle) : -1
      return at < 0 ? [] : [[from[at], to[at + needle.length - 1]]]
    })
    .sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = []
  for (const [start, end] of ranges) {
    const last = merged.at(-1)
    if (last && start <= last[1]) last[1] = Math.max(last[1], end)
    else merged.push([start, end])
  }
  return { text, ranges: merged }
}
