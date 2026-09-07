'use client'

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { itemName, itemTitle, type MapItem } from './items'

export type SheetStage = 'closed' | 'peek' | 'expanded'

const PEEK_RATIO = 0.35
const PEEK_MIN = 200
const FLICK_VELOCITY = 0.5
const DRAG_THRESHOLD = 4
const RUBBER_BAND = 0.25

export function peekHeight(containerHeight: number) {
  return Math.max(PEEK_MIN, containerHeight * PEEK_RATIO)
}

type Drag = {
  startY: number
  startOffset: number
  lastOffset: number
  fromBody: boolean
  active: boolean
  samples: { t: number; y: number }[]
}

type Props = {
  item: MapItem | null
  onClose: () => void
}

function getSnapPoints(sheet: HTMLDivElement | null) {
  if (!sheet || !sheet.parentElement) return { expanded: 0, peek: 0, closed: 0 }
  const sheetHeight = sheet.offsetHeight
  return {
    expanded: 0,
    peek: sheetHeight - peekHeight(sheet.parentElement.clientHeight),
    closed: sheetHeight,
  }
}

function getCurrentOffset(sheet: HTMLDivElement | null) {
  if (!sheet) return 0
  return new DOMMatrix(getComputedStyle(sheet).transform).m42
}

function applyOffset(
  sheet: HTMLDivElement | null,
  dim: HTMLDivElement | null,
  offset: number,
  animate: boolean,
) {
  if (!sheet || !dim) return
  sheet.style.transition = animate ? '' : 'none'
  dim.style.transition = animate ? '' : 'none'
  sheet.style.transform = `translateY(${offset}px)`
  const { peek } = getSnapPoints(sheet)
  dim.style.opacity = peek > 0 ? String(Math.min(1, Math.max(0, (peek - offset) / peek))) : '0'
}

export function DetailSheet({ item, onClose }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const dimRef = useRef<HTMLDivElement>(null)
  const drag = useRef<Drag | null>(null)
  const [stage, setStage] = useState<SheetStage>('closed')
  const [shown, setShown] = useState<MapItem | null>(item)
  const [prevItem, setPrevItem] = useState<MapItem | null>(item)

  if (item !== prevItem) {
    setPrevItem(item)
    if (item) {
      setShown(item)
      if (stage === 'closed') setStage('peek')
    } else {
      setStage('closed')
    }
  }

  const snapPoints = () => getSnapPoints(sheetRef.current)
  const apply = (offset: number, animate: boolean) =>
    applyOffset(sheetRef.current, dimRef.current, offset, animate)

  useLayoutEffect(() => {
    const sync = () =>
      applyOffset(sheetRef.current, dimRef.current, getSnapPoints(sheetRef.current)[stage], true)
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [stage])

  useEffect(() => {
    if (stage === 'closed') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [stage, onClose])

  useEffect(() => {
    const body = bodyRef.current
    if (!body) return
    let startY = 0
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      if (body.scrollTop <= 0 && e.touches[0].clientY > startY) e.preventDefault()
    }
    body.addEventListener('touchstart', onTouchStart, { passive: true })
    body.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      body.removeEventListener('touchstart', onTouchStart)
      body.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  const settle = (next: SheetStage) => {
    if (next === 'closed') {
      setStage('closed')
      onClose()
      return
    }
    if (next === stage) apply(snapPoints()[next], true)
    else setStage(next)
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const body = bodyRef.current
    const fromBody = !!body && body.contains(e.target as Node)
    if (fromBody && stage === 'expanded' && body.scrollTop > 0) return
    const startOffset = getCurrentOffset(sheetRef.current)
    drag.current = {
      startY: e.clientY,
      startOffset,
      lastOffset: startOffset,
      fromBody,
      active: false,
      samples: [{ t: e.timeStamp, y: e.clientY }],
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    const dy = e.clientY - d.startY
    if (!d.active) {
      if (Math.abs(dy) < DRAG_THRESHOLD) return
      if (d.fromBody && stage === 'expanded' && dy < 0) {
        drag.current = null
        return
      }
      d.active = true
    }
    const { closed } = snapPoints()
    let offset = d.startOffset + dy
    if (offset < 0) offset *= RUBBER_BAND
    offset = Math.min(offset, closed)
    d.lastOffset = offset
    d.samples.push({ t: e.timeStamp, y: e.clientY })
    if (d.samples.length > 5) d.samples.shift()
    apply(offset, false)
  }

  const onPointerUp = () => {
    const d = drag.current
    drag.current = null
    if (!d || !d.active) return
    const points = snapPoints()
    const first = d.samples[0]
    const last = d.samples[d.samples.length - 1]
    const velocity = last.t > first.t ? (last.y - first.y) / (last.t - first.t) : 0
    const offset = d.lastOffset

    let next: SheetStage
    if (velocity > FLICK_VELOCITY) next = offset > points.peek ? 'closed' : 'peek'
    else if (velocity < -FLICK_VELOCITY) next = 'expanded'
    else {
      const stages: SheetStage[] = ['expanded', 'peek', 'closed']
      next = stages.reduce((best, s) =>
        Math.abs(points[s] - offset) < Math.abs(points[best] - offset) ? s : best,
      )
    }
    settle(next)
  }

  const onPointerCancel = () => {
    drag.current = null
    apply(snapPoints()[stage], true)
  }

  const title = shown ? itemTitle(shown) : ''
  const name = shown ? itemName(shown) : ''

  return (
    <>
      <div
        ref={dimRef}
        className="absolute inset-0 z-[1090] bg-black/40 opacity-0 transition-opacity duration-300 motion-reduce:transition-none"
        style={{ pointerEvents: stage === 'expanded' ? 'auto' : 'none' }}
        onClick={() => setStage('peek')}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-label={title}
        aria-hidden={stage === 'closed'}
        className="absolute inset-x-0 bottom-0 z-[1100] flex h-[90%] touch-none flex-col rounded-t-2xl bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform motion-reduce:transition-none"
        style={{ transform: 'translateY(100%)' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <div className="flex shrink-0 justify-center pt-2 pb-1">
          <div className="h-1 w-10 rounded-full bg-neutral-300" />
        </div>
        <header className="flex shrink-0 items-start justify-between gap-4 px-5 pt-1 pb-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-neutral-500">{title}</p>
            <h2 className="truncate text-lg font-semibold text-foreground">{name}</h2>
          </div>
          <button
            type="button"
            aria-label="닫기"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600"
            onClick={onClose}
          >
            ×
          </button>
        </header>
        <div
          ref={bodyRef}
          className={`min-h-0 flex-1 px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-sm leading-6 text-neutral-700 ${
            stage === 'expanded'
              ? 'touch-pan-y overflow-y-auto overscroll-contain'
              : 'overflow-hidden'
          }`}
        >
          <p>
            소개 문구가 들어갑니다. 지금은 임시 문구이며 API 연결 후 실제 내용으로 바뀝니다.
          </p>
          <dl className="mt-4 grid grid-cols-[4rem_1fr] gap-y-2">
            <dt className="text-neutral-500">운영 시간</dt>
            <dd>11:00 – 20:00 (임시)</dd>
            <dt className="text-neutral-500">위치</dt>
            <dd>{title}</dd>
            <dt className="text-neutral-500">주최</dt>
            <dd>학과·동아리 이름 (임시)</dd>
          </dl>
          <h3 className="mt-6 font-semibold text-foreground">상세 설명</h3>
          {Array.from({ length: 6 }, (_, i) => (
            <p key={i} className="mt-3">
              상세 설명 임시 단락 {i + 1}. 시트를 위로 끌어 올리면 확장되고, 확장 상태에서는 이
              영역이 스크롤됩니다. 맨 위에서 아래로 끌면 다시 접힙니다.
            </p>
          ))}
        </div>
      </div>
    </>
  )
}
