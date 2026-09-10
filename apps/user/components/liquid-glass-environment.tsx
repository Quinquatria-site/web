'use client'

import { useId, useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react'

// 중심은 중립값(128), 가장자리는 반대 방향으로 이동시켜 볼록한 렌즈를 흉내 낸다.
const REFRACTION_MAP = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
    <defs>
      <linearGradient id="x">
        <stop stop-color="#ff0000"/>
        <stop offset=".12" stop-color="#800000"/>
        <stop offset=".88" stop-color="#800000"/>
        <stop offset="1" stop-color="#000000"/>
      </linearGradient>
      <linearGradient id="y" x2="0" y2="1">
        <stop stop-color="#00ff00"/>
        <stop offset=".18" stop-color="#008000"/>
        <stop offset=".82" stop-color="#008000"/>
        <stop offset="1" stop-color="#000000"/>
      </linearGradient>
    </defs>
    <rect width="800" height="400" fill="url(#x)"/>
    <rect width="800" height="400" fill="url(#y)" style="mix-blend-mode:screen"/>
  </svg>
`)}`

// 카드·패널은 28px, 작은 컨트롤은 8px의 가장자리 굴절을 사용한다.
const REFRACTION = { panel: 28, control: 8 } as const

export function LiquidGlassEnvironment({ children }: { children: ReactNode }) {
  const id = `liquid-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const highlighted = useRef<HTMLElement | null>(null)

  function resetReflection() {
    highlighted.current?.style.removeProperty('--liquid-highlight-x')
    highlighted.current?.style.removeProperty('--liquid-highlight-y')
    highlighted.current = null
  }

  function moveReflection(event: PointerEvent<HTMLDivElement>) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      resetReflection()
      return
    }
    const target =
      event.target instanceof Element ? event.target.closest<HTMLElement>('.liquid-glass') : null
    if (target !== highlighted.current) resetReflection()
    if (!target) return
    highlighted.current = target
    const bounds = target.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width))
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height))
    target.style.setProperty('--liquid-highlight-x', `${15 + x * 25}%`)
    target.style.setProperty('--liquid-highlight-y', `${5 + y * 20}%`)
  }

  return (
    <div
      className="lighting-shell relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-surface"
      style={
        {
          '--liquid-filter-panel': `url("#${id}-panel")`,
          '--liquid-filter-control': `url("#${id}-control")`,
        } as CSSProperties
      }
      onPointerMove={moveReflection}
      onPointerLeave={resetReflection}
      onPointerUp={resetReflection}
      onPointerCancel={resetReflection}
      onScrollCapture={resetReflection}
    >
      <svg aria-hidden focusable="false" className="liquid-filter-definitions">
        <defs>
          {Object.entries(REFRACTION).map(([kind, scale]) => (
            <filter
              key={kind}
              id={`${id}-${kind}`}
              x="0"
              y="0"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
            >
              <feImage
                href={REFRACTION_MAP}
                width="100%"
                height="100%"
                preserveAspectRatio="none"
                result="lens"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="lens"
                scale={scale}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          ))}
        </defs>
      </svg>
      <div aria-hidden className="app-light" />
      {children}
    </div>
  )
}
