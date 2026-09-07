'use client'

type Props = {
  onZoomIn: () => void
  onZoomOut: () => void
  canZoomIn?: boolean
  canZoomOut?: boolean
}

const button =
  'flex size-12 items-center justify-center text-2xl font-light leading-none text-foreground disabled:text-neutral-300'

export function ZoomControl({ onZoomIn, onZoomOut, canZoomIn = true, canZoomOut = true }: Props) {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-md">
      <button
        type="button"
        aria-label="확대"
        className={button}
        disabled={!canZoomIn}
        onClick={onZoomIn}
      >
        +
      </button>
      <div className="mx-3 h-px bg-neutral-200" />
      <button
        type="button"
        aria-label="축소"
        className={button}
        disabled={!canZoomOut}
        onClick={onZoomOut}
      >
        −
      </button>
    </div>
  )
}
