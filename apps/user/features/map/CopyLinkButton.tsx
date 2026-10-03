'use client'

import { useEffect, useState } from 'react'
import { getMessages } from '@/shared/i18n/messages'
import { localePath } from '@/shared/i18n/paths'
import { useLocale } from '@/shared/i18n/useLocale'
import type { MapPlace } from './map-place'

// 복사했다는 글자를 보여 주는 시간(ms)
const COPIED_MS = 2000

const LINK =
  'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z'
const CHECK = 'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'

/** 장소 주소를 복사하는 알약 버튼. 복사하면 잠깐 "복사했어요" 로 바뀐다 */
export function CopyLinkButton({ placeId }: { placeId: MapPlace['id'] }) {
  const locale = useLocale()
  const { sheet } = getMessages(locale).map
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), COPIED_MS)
    return () => clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    // 공유 카드가 이 장소로 뜨게, 지금 주소창 대신 장소 상세 주소를 만든다
    const url = new URL(localePath(locale, `/map/${placeId}`), location.origin).href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // 권한이 막힌 브라우저는 복사되지 않았으니 글자를 바꾸지 않는다
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-[30px] items-center gap-1.5 self-start rounded-full bg-accent pr-3.5 pl-3 text-[13px] leading-[normal] font-semibold text-on-accent shadow-[0_2px_4px_rgb(0_0_0/0.25)]"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-current">
        <path d={copied ? CHECK : LINK} />
      </svg>
      {/* 바뀐 글자를 스크린리더도 읽게 알린다 */}
      <span aria-live="polite">{copied ? sheet.linkCopied : sheet.copyLink}</span>
    </button>
  )
}
