const KST_OFFSET_MS = 9 * 60 * 60 * 1000

/**
 * 어느 offset 으로 온 ISO 8601 이든 같은 순간의 `+09:00` 표기로 바꾼다.
 *
 * 서버는 시각을 DB 세션 시간대 그대로 준다 — Cloudtype 은 UTC 라 `Z`/`+00:00` 로 온다.
 * 그런데 화면은 이 문자열을 잘라서 날짜·시각을 읽는다(`dateTimeLabel`, 장소 운영시간).
 * UTC 그대로 두면 9시간 어긋난 값이 조용히 찍힌다. 그래서 응답을 캐시에 넣기 전에
 * 여기를 한 번 거친다.
 *
 * 순간은 바뀌지 않으므로 `Date.parse` 로 정렬하는 곳은 영향이 없다.
 */
export function toKstIso(iso: string): string {
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return iso
  return `${new Date(ms + KST_OFFSET_MS).toISOString().slice(0, 19)}+09:00`
}
