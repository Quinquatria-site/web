'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { getMessages } from '@/shared/i18n/messages'
import { localePath } from '@/shared/i18n/paths'
import { useLocale } from '@/shared/i18n/useLocale'
import type { MapPlace } from './map-place'
import { placeShareTitle } from './place-share-title'

// 복사했다·못 했다는 글자를 보여 주는 시간(ms)
const NOTICE_MS = 2000

const SHARE =
  'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z'
const LINK =
  'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z'
const CHECK = 'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'
const ERROR =
  'M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z'

type Notice = 'copied' | 'failed' | null

// 공유 지원 여부는 페이지 안에서 바뀌지 않아 구독할 것이 없다
const subscribeNothing = () => () => {}

// 공유 시트를 열 수 있는 브라우저인지. 데스크톱 Firefox·일부 인앱 브라우저는 share 가 없다
function canShareUrl(url: string) {
  if (typeof navigator.share !== 'function') return false
  return navigator.canShare?.({ url }) ?? true
}

// 사용자가 닫았거나(Abort) 이미 공유 중이면(InvalidState) 실패가 아니니 복사로 넘기지 않는다
function isQuietShareError(error: unknown) {
  const name = error instanceof Error || error instanceof DOMException ? error.name : ''
  return name === 'AbortError' || name === 'InvalidStateError'
}

/** 장소 주소를 기기 공유 시트로 보내는 아이콘 버튼. 카테고리 뱃지 높이에 맞춘다. 공유가 안 되는 브라우저에선 링크를 복사한다 */
export function ShareLinkButton({ place }: { place: MapPlace }) {
  const locale = useLocale()
  const { sheet } = getMessages(locale).map
  // 공유 카드가 이 장소로 뜨게, 지금 주소창 대신 장소 상세 주소를 쓴다
  const placeUrl = () => new URL(localePath(locale, `/map/${place.id}`), location.origin).href
  // 서버 HTML 과 하이드레이션 첫 그림은 복사로 맞추고, 그 뒤에 브라우저를 보고 공유로 바꾼다
  const shareable = useSyncExternalStore(
    subscribeNothing,
    () => canShareUrl(placeUrl()),
    () => false,
  )
  const [notice, setNotice] = useState<Notice>(null)
  const [busy, setBusy] = useState(false)
  // state 는 다음 그림까지 늦으니, 빠른 두 번 누름은 ref 로 막는다
  const busyRef = useRef(false)

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), NOTICE_MS)
    return () => clearTimeout(timer)
  }, [notice])

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setNotice('copied')
    } catch {
      // 권한·보안 출처 문제로 막히면 조용히 넘기지 않고 못 했다고 알린다
      setNotice('failed')
    }
  }

  const share = async () => {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(true)
    const url = placeUrl()
    try {
      // 마운트 뒤 감지와 달리 누른 순간에도 다시 본다. 그새 막힌 환경도 복사로 넘긴다
      if (!canShareUrl(url)) return await copy(url)
      try {
        await navigator.share({ title: placeShareTitle(locale, place), url })
      } catch (error) {
        // NotAllowed(사용자 동작 아님·권한·iframe)·TypeError(데이터 거부)·그 밖은 복사로 대신한다
        if (!isQuietShareError(error)) await copy(url)
      }
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }

  const icon = notice === 'copied' ? CHECK : notice === 'failed' ? ERROR : shareable ? SHARE : LINK
  const label =
    notice === 'copied'
      ? sheet.linkCopied
      : notice === 'failed'
        ? sheet.copyFailed
        : shareable
          ? sheet.share
          : sheet.copyLink

  return (
    <button
      type="button"
      onClick={share}
      disabled={busy}
      aria-busy={busy}
      // 뱃지에 맞춘 23 은 손가락에 작아, 보이지 않는 가장자리로 누르는 범위를 44 까지 넓힌다
      className="relative inline-flex size-[23px] shrink-0 items-center justify-center rounded-full border border-border bg-white text-text after:absolute after:-inset-[10.5px]"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-3.5 fill-current">
        <path d={icon} />
      </svg>
      {/* 글자는 숨겨도 버튼 이름이 되고, 바뀌면 스크린리더가 읽는다 */}
      <span aria-live="polite" className="sr-only">
        {label}
      </span>
    </button>
  )
}
