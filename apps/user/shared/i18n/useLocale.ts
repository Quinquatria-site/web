'use client'

import { useParams } from 'next/navigation'
import { DEFAULT_LOCALE, isLocale, type Locale } from './locales'

/** 클라이언트 컴포넌트에서 주소의 언어를 읽는다 */
export function useLocale(): Locale {
  const { lang } = useParams<{ lang?: string }>()
  return lang && isLocale(lang) ? lang : DEFAULT_LOCALE
}
