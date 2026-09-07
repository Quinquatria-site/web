'use client'

import { KIND_LABEL, type MarkerKind } from './items'

type Props = {
  active: Record<MarkerKind, boolean>
  onToggle: (kind: MarkerKind) => void
}

const KINDS: MarkerKind[] = ['booth', 'pub', 'aid']

const chipOn: Record<MarkerKind, string> = {
  booth: 'bg-blue-600 text-white',
  pub: 'bg-red-600 text-white',
  aid: 'bg-green-600 text-white',
}

export function FilterChips({ active, onToggle }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none]">
      {KINDS.map((kind) => (
        <button
          key={kind}
          type="button"
          aria-pressed={active[kind]}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold shadow-md transition-colors ${
            active[kind] ? chipOn[kind] : 'bg-white text-neutral-600'
          }`}
          onClick={() => onToggle(kind)}
        >
          {KIND_LABEL[kind]}
        </button>
      ))}
    </div>
  )
}
