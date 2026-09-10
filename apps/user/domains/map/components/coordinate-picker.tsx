'use client'

import { useState } from 'react'
import { useMapEvents } from 'react-leaflet'
import { IMAGE_HEIGHT } from '../libs/campus'

// 개발 중 좌표를 찍기 위한 도구. 지도를 누르면 그 지점의 x · y 를 보여주고 복사한다.
export function CoordinatePicker() {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null)

  useMapEvents({
    click: (event) => {
      const next = {
        x: Math.round(event.latlng.lng),
        y: Math.round(IMAGE_HEIGHT - event.latlng.lat),
      }
      setPoint(next)
      void navigator.clipboard?.writeText(`x: ${next.x}, y: ${next.y}`).catch(() => {})
    },
  })

  if (!point) return null

  return (
    <div className="pointer-events-none absolute top-4 left-4 z-[1000] rounded-pill border border-line bg-surface-muted px-3 py-1.5 font-mono text-xs text-ink">
      x: {point.x}, y: {point.y}
    </div>
  )
}
