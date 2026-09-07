'use client'

import { useState } from 'react'
import type { Section, SectionId } from './campus'

type Props = {
  sections: Section[]
  onSelect: (id: SectionId | 'all') => void
}

const circle =
  'flex size-12 items-center justify-center rounded-full bg-white text-sm font-semibold text-foreground shadow-md'

export function SectionButton({ sections, onSelect }: Props) {
  const [open, setOpen] = useState(false)

  const select = (id: SectionId | 'all') => {
    onSelect(id)
    setOpen(false)
  }

  return (
    <div className="absolute right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[1000] flex flex-col items-center gap-2">
      {open && (
        <ul className="flex flex-col items-center gap-2">
          {sections.map((section) => (
            <li key={section.id}>
              <button type="button" className={circle} onClick={() => select(section.id)}>
                {section.label}
              </button>
            </li>
          ))}
          <li>
            <button type="button" className={circle} onClick={() => select('all')}>
              전체
            </button>
          </li>
        </ul>
      )}
      <button
        type="button"
        className={circle}
        aria-expanded={open}
        aria-label="구역 선택"
        onClick={() => setOpen((v) => !v)}
      >
        구역
      </button>
    </div>
  )
}
