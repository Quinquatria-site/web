'use client'

import { useLang } from '@/components/lang-provider'
import { DOCK_TIER_BOTTOM } from '@/libs/dock'

const button =
  'flex h-10 w-11 items-center justify-center text-ink transition-colors disabled:text-line'

export function ZoomControl({
  onZoomIn,
  onZoomOut,
  canZoomIn,
  canZoomOut,
}: {
  onZoomIn: () => void
  onZoomOut: () => void
  canZoomIn: boolean
  canZoomOut: boolean
}) {
  const { copy } = useLang()

  return (
    // dock 이 화면 폭을 다 쓰므로 한 층 위로 올라간다. 구역 칩과 같은 줄 왼쪽이 빈자리다.
    <div
      className="pointer-events-none absolute left-4 z-[1000]"
      style={{ bottom: DOCK_TIER_BOTTOM }}
    >
      <div className="pointer-events-auto flex h-10 items-center overflow-hidden rounded-xl border border-line bg-surface">
        <button
          type="button"
          aria-label={copy.map.zoomOut}
          className={button}
          disabled={!canZoomOut}
          onClick={onZoomOut}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            className="size-5"
            aria-hidden
          >
            <path d="M6 12h12" />
          </svg>
        </button>
        <div className="my-2.5 w-px bg-line" />
        <button
          type="button"
          aria-label={copy.map.zoomIn}
          className={button}
          disabled={!canZoomIn}
          onClick={onZoomIn}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            className="size-5"
            aria-hidden
          >
            <path d="M12 6v12M6 12h12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
