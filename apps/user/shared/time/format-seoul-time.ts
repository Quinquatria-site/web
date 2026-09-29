// 숫자만 쓰는 형식이라 언어와 무관하고, 빌드 서버(UTC)·보는 기기와 상관없이 축제 현지 시각으로 적는다
const FORMAT = new Intl.DateTimeFormat('ko', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Asia/Seoul',
})

/** ISO 시각을 서울 기준 `16:28` 로, withDate 면 `2026.10.07 16:28` 로 적는다 */
export function formatSeoulTime(iso: string, { withDate = false } = {}) {
  const parts = Object.fromEntries(
    FORMAT.formatToParts(new Date(iso)).map(({ type, value }) => [type, value]),
  )
  const time = `${parts.hour}:${parts.minute}`
  return withDate ? `${parts.year}.${parts.month}.${parts.day} ${time}` : time
}
