import { HTML_LANG, type Locale } from '@/shared/i18n/locales'

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

/** ISO 시각의 서울 날짜를 그 언어 요일과 함께 `10.07(수)` 로 적는다 */
export function formatSeoulDay(iso: string, locale: Locale) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat(HTML_LANG[locale], {
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
      timeZone: 'Asia/Seoul',
    })
      .formatToParts(new Date(iso))
      .map(({ type, value }) => [type, value]),
  )
  return `${parts.month}.${parts.day}(${parts.weekday})`
}
