'use client'

import { useLang } from '@/components/lang-provider'
import { MARKER_KINDS, type MarkerKind } from '../libs/items'
import { MARKER_COLOR, MARKER_FORM, type MarkerForm } from '../libs/markers'

// 칩 안의 표식은 지도 마커의 실루엣을 그대로 줄인 것이다. 칩이 곧 범례가 된다.
const MARK: Record<MarkerForm, string> = {
  circle: 'size-3 rounded-full',
  square: 'size-3 rounded-[3px]',
  ring: 'size-3 rounded-full border-[3px]',
  diamond: 'size-2.5 rotate-45 rounded-[2px]',
  pill: 'h-2.5 w-4 rounded-full',
}

function KindMark({ kind, active }: { kind: MarkerKind; active: boolean }) {
  const form = MARKER_FORM[kind]
  // 켜진 칩은 바탕이 그 종류의 색이라, 표식만 밝은 색으로 뒤집는다.
  const color = active ? 'var(--color-accent-ink)' : MARKER_COLOR[kind]

  return (
    <span
      aria-hidden
      className={`shrink-0 border-transparent ${MARK[form]}`}
      style={{
        backgroundColor: form === 'ring' ? 'transparent' : color,
        borderColor: color,
      }}
    />
  )
}

export function FilterChips({
  active,
  onToggle,
}: {
  active: Record<MarkerKind, boolean>
  onToggle: (kind: MarkerKind) => void
}) {
  const { copy } = useLang()

  return (
    <div
      role="group"
      aria-label={copy.map.filters}
      className="pointer-events-none absolute inset-x-0 top-0 z-[1000] flex flex-wrap gap-1.5 px-4 pt-4"
    >
      {MARKER_KINDS.map((kind) => {
        const on = active[kind]
        return (
          <button
            key={kind}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(kind)}
            style={
              on
                ? { backgroundColor: MARKER_COLOR[kind], borderColor: MARKER_COLOR[kind] }
                : undefined
            }
            className={`pointer-events-auto flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition-colors ${
              on ? 'text-accent-ink' : 'border-line bg-surface text-ink-muted'
            }`}
          >
            <KindMark kind={kind} active={on} />
            {copy.map.kind[kind]}
          </button>
        )
      })}
    </div>
  )
}
