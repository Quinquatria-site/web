'use client'

import { useLang } from '@/components/lang-provider'
import { DOCK_BOTTOM } from '@/libs/dock'

const button =
  'flex size-11 items-center justify-center text-ink transition-colors disabled:text-line'

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
    // dock 이 우측 하단을 쓰므로 반대편에 둔다.
    <div className="pointer-events-none absolute left-4 z-[1000]" style={{ bottom: DOCK_BOTTOM }}>
      <div className="pointer-events-auto flex flex-col overflow-hidden rounded-xl border border-line bg-surface/85 backdrop-blur-sm">
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
        <div className="mx-2.5 h-px bg-line" />
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
      </div>
    </div>
  )
}
