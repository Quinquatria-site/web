'use client'

import { KIND_LABEL, type MarkerKind } from '../libs/items'

const KINDS: MarkerKind[] = ['booth', 'pub', 'aid']

export function FilterChips({
  active,
  onToggle,
}: {
  active: Record<MarkerKind, boolean>
  onToggle: (kind: MarkerKind) => void
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] flex gap-2 px-4 pt-4">
      {KINDS.map((kind) => (
        <button
          key={kind}
          type="button"
          aria-pressed={active[kind]}
          onClick={() => onToggle(kind)}
          className={`pointer-events-auto flex h-10 shrink-0 items-center rounded-full border px-4 text-[13px] font-medium transition-colors ${
            active[kind]
              ? 'border-accent bg-accent text-accent-ink'
              : 'border-line bg-surface/85 text-ink-muted backdrop-blur-sm'
          }`}
        >
          {KIND_LABEL[kind]}
        </button>
      ))}
    </div>
  )
}
