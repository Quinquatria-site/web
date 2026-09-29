'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Fragment } from 'react'
import { HTML_LANG, LOCALE_NAMES, LOCALES } from '@/shared/i18n/locales'
import { getMessages } from '@/shared/i18n/messages'
import { localePath } from '@/shared/i18n/paths'
import { useLocale } from '@/shared/i18n/useLocale'
import languageIcon from './images/language.svg'

/** 홈 랜딩 오른쪽 위 언어 선택. 언어 이름을 누르면 그 언어의 홈으로 가고, 지금 언어에 밑줄을 긋는다 */
export function LanguageSwitcher() {
  const locale = useLocale()
  return (
    <nav
      aria-label={getMessages(locale).home.languageLabel}
      className="absolute top-[22px] right-[19px] flex items-center gap-2 rounded-[28px] border border-primary-border bg-secondary/20 px-2 py-1.5 text-xs leading-[normal] text-primary-border"
    >
      <Image src={languageIcon} alt="" unoptimized className="size-7" />
      <ul className="flex items-center gap-2">
        {LOCALES.map((l, i) => (
          <Fragment key={l}>
            {i > 0 && <li aria-hidden className="h-3 w-px bg-primary-border" />}
            <li>
              <Link
                href={localePath(l, '/')}
                lang={HTML_LANG[l]}
                hrefLang={HTML_LANG[l]}
                aria-current={l === locale ? 'page' : undefined}
                className={l === locale ? 'underline' : undefined}
              >
                {LOCALE_NAMES[l]}
              </Link>
            </li>
          </Fragment>
        ))}
      </ul>
    </nav>
  )
}
