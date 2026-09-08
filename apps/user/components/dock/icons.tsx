type IconProps = { className?: string }

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export function HomeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5.5H9V20H5a1 1 0 0 1-1-1z" />
    </svg>
  )
}

export function TimelineIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M7 4v16" />
      <circle cx="7" cy="8.5" r="1.75" />
      <circle cx="7" cy="15.5" r="1.75" />
      <path d="M12 7.5h7M12 11h4M12 14.5h7M12 18h4" />
    </svg>
  )
}

export function MapIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  )
}

export function NoticeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M5 8h9l5-3v14l-5-3H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
      <path d="M8 16v3h3" />
    </svg>
  )
}

export function LostFoundIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m15 15 4.5 4.5" />
      <path d="M10.5 8v3M10.5 13.2h.01" />
    </svg>
  )
}

export function ArrowUpIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  )
}
