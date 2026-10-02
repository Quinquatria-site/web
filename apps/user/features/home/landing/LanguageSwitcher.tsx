'use client'

import Link from 'next/link'
import { Fragment, useEffect, useId, useRef, useState } from 'react'
import { HTML_LANG, LOCALE_NAMES, LOCALES } from '@/shared/i18n/locales'
import { getMessages } from '@/shared/i18n/messages'
import { localePath } from '@/shared/i18n/paths'
import { useLocale } from '@/shared/i18n/useLocale'

const ITEM_FADE =
  'translate-x-2.5 opacity-0 transition-[opacity,translate] duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-data-open:translate-x-0 group-data-open:opacity-100 motion-reduce:translate-x-0 motion-reduce:transition-none'

// 펼칠 때만 테두리가 먼저 늘어난 뒤 항목이 한 칸씩 따라 들어오게 늦춘다
const itemDelay = (open: boolean, order: number) => ({
  transitionDelay: open ? `${120 + order * 30}ms` : '0ms',
})

/** 홈 랜딩 오른쪽 위 언어 선택. 지구본을 누르면 왼쪽으로 늘어나며 언어가 나오고, 다시 누르거나 바깥·Esc 로 접힌다 */
export function LanguageSwitcher() {
  const locale = useLocale()
  const label = getMessages(locale).home.languageLabel
  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listId = useId()

  useEffect(() => {
    if (!open) return
    const closeOnOutside = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutside)
    return () => document.removeEventListener('pointerdown', closeOnOutside)
  }, [open])

  return (
    <nav
      ref={navRef}
      aria-label={label}
      data-open={open || undefined}
      onKeyDown={(e) => {
        if (e.key !== 'Escape' || !open) return
        setOpen(false)
        buttonRef.current?.focus()
      }}
      // 탭으로 언어 목록을 빠져나가면 펼친 채 남지 않게 접는다
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
      }}
      className="group absolute top-[22px] right-[19px] flex items-center rounded-[28px] border border-primary-border bg-dock/75 p-[5px] text-xs leading-[normal] text-primary-border"
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="grid size-7 shrink-0 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary-border"
      >
        <svg
          viewBox="0 0 28 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden
          className="size-7 overflow-visible"
        >
          <circle cx="14" cy="14" r="11" />
          <path d="M3.5 10.5h21M3.5 17.5h21" />
          <ellipse cx="14" cy="14" rx="5" ry="11" />
        </svg>
      </button>
      {/* 0fr→1fr 로 목록 폭을 열어 지구본이 왼쪽으로 밀려난다. visibility 도 함께 넘겨 접힌 동안 탭·낭독에서 빠진다 */}
      <div
        id={listId}
        className="invisible grid grid-cols-[0fr] transition-[grid-template-columns,visibility] duration-420 ease-[cubic-bezier(.22,1,.36,1)] group-data-open:visible group-data-open:grid-cols-[1fr] motion-reduce:transition-none"
      >
        <div className="min-w-0 overflow-hidden">
          <ul className="flex items-center gap-2 pr-1 pl-2 whitespace-nowrap">
            {LOCALES.map((l, i) => (
              <Fragment key={l}>
                {i > 0 && (
                  <li
                    aria-hidden
                    style={itemDelay(open, i * 2 - 1)}
                    className={`h-3 w-px shrink-0 bg-primary-border ${ITEM_FADE}`}
                  />
                )}
                <li style={itemDelay(open, i * 2)} className={ITEM_FADE}>
                  <Link
                    href={localePath(l, '/')}
                    lang={HTML_LANG[l]}
                    hrefLang={HTML_LANG[l]}
                    aria-current={l === locale ? 'page' : undefined}
                    className={`block py-1 ${l === locale ? 'underline underline-offset-3' : ''}`}
                  >
                    {LOCALE_NAMES[l]}
                  </Link>
                </li>
              </Fragment>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}
