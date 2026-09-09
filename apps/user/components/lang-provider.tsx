'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { COPY, type Lang } from '@/libs/i18n'

// 문구 자체가 아니라 언어만 나른다. 문구에 함수가 섞여 있어 서버에서 넘길 수 없다.
const LangContext = createContext<Lang | null>(null)

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext value={lang}>{children}</LangContext>
}

export function useLang() {
  const lang = useContext(LangContext)
  if (!lang) throw new Error('useLang 은 LangProvider 안에서만 쓸 수 있다')
  return { lang, copy: COPY[lang] }
}
