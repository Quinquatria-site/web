'use client'

import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LANG_MARK, LANG_NAME, LANGS } from '@/libs/i18n'
import { useLang } from './lang-provider'

const POP = { type: 'spring', stiffness: 620, damping: 32, mass: 0.6 } as const

export function LanguageSwitcher() {
  const { lang, copy } = useLang()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // '/ko/map' 에서 언어 자리만 갈아 끼운다
  const rest = pathname.split('/').slice(2).join('/')

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${copy.language} — ${LANG_NAME[lang]}`}
        className="relative z-10 flex h-11 w-11 items-center justify-center rounded-pill border border-line bg-surface-muted text-[15px] font-medium text-ink"
      >
        {LANG_MARK[lang]}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* 바깥을 누르면 닫힌다. 아래 화면이 눌리는 것도 함께 막는다 */}
            <div className="fixed inset-0 z-0" onClick={() => setOpen(false)} />
            <motion.div
              role="menu"
              aria-label={copy.language}
              initial={{ opacity: 0, scale: 0.88, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: -6 }}
              transition={POP}
              // 위쪽 오른끝을 축으로 아래로 펼쳐진다
              style={{ transformOrigin: 'top right' }}
              className="absolute top-full right-0 z-10 mt-2 flex flex-col overflow-hidden rounded-card border border-line bg-surface-muted"
            >
              {LANGS.map((option) => {
                const active = option === lang
                return (
                  <Link
                    key={option}
                    href={`/${option}${rest ? `/${rest}` : ''}`}
                    role="menuitem"
                    aria-current={active ? 'true' : undefined}
                    aria-label={LANG_NAME[option]}
                    onClick={() => setOpen(false)}
                    className={`flex h-11 w-11 items-center justify-center text-[15px] font-medium ${
                      active
                        ? 'bg-surface-muted text-accent underline underline-offset-4'
                        : 'text-ink-muted'
                    }`}
                  >
                    {LANG_MARK[option]}
                  </Link>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
