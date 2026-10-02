import { notFound } from 'next/navigation'
import { lang } from 'next/root-params'
import { isLocale, type Locale } from './locales'

/** 서버 컴포넌트에서 주소의 언어를 읽는다. props 로 내려받지 않고 어디서든 부른다 */
export async function getLocale(): Promise<Locale> {
  const value = await lang()
  if (!isLocale(value)) notFound()
  return value
}
