import { HTML_LANG, type Locale } from '@/shared/i18n/locales'

/** 원 단위 가격을 언어에 맞춰 적는다. 한국어는 시안처럼 36,000원, 그 밖은 ₩36,000 */
export function formatPrice(price: number, locale: Locale) {
  const amount = price.toLocaleString(HTML_LANG[locale])
  // 통화 형식(currency)은 Node 와 브라우저가 중국어에서 ₩·￦ 를 달리 골라 하이드레이션이 깨져 기호를 직접 붙인다
  return locale === 'ko' ? `${amount}원` : `₩${amount}`
}
