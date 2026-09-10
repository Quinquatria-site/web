'use client'

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useLang } from '@/components/lang-provider'
import { itemName, itemTitle, type MapItem } from '../libs/items'

export type SheetStage = 'closed' | 'peek' | 'expanded'

// 살짝 올라온 상태의 높이. 화면의 35% 를 쓰되 200px 아래로는 안 내려간다.
const PEEK_RATIO = 0.35
const PEEK_MIN = 200
// 이 속도 이상으로 튕기면 위치와 무관하게 방향으로 판단한다.
const FLICK_VELOCITY = 0.5
const DRAG_THRESHOLD = 4
// 펼침 한계를 넘겨 끌면 저항을 준다.
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
  // 펼칠수록 뒤가 어두워진다.
  dim.style.opacity = peek > 0 ? String(Math.min(1, Math.max(0, (peek - offset) / peek))) : '0'
}

export function DetailSheet({ item, onClose }: { item: MapItem | null; onClose: () => void }) {
  const { lang, copy } = useLang()
  const sheetRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const dimRef = useRef<HTMLDivElement>(null)
  const drag = useRef<Drag | null>(null)
  const [stage, setStage] = useState<SheetStage>('closed')
  // 닫히는 동안에도 내용이 남아 있어야 해서 마지막으로 연 항목을 따로 들고 있는다.
  const [shown, setShown] = useState<MapItem | null>(item)
  const [prev, setPrev] = useState<MapItem | null>(item)

  if (item !== prev) {
    setPrev(item)
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

  // 단계가 바뀌거나 창 크기가 변하면 그 단계의 위치로 붙인다.
  useLayoutEffect(() => {
    const sync = () =>
      applyOffset(sheetRef.current, dimRef.current, getSnapPoints(sheetRef.current)[stage], true)
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [stage])

  useEffect(() => {
    if (stage === 'closed') return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [stage, onClose])

  // 본문 맨 위에서 아래로 끌 때 브라우저의 당겨서 새로고침이 끼어들지 않게 막는다.
  useEffect(() => {
    const body = bodyRef.current
    if (!body) return
    let startY = 0
    const onTouchStart = (event: TouchEvent) => {
      startY = event.touches[0].clientY
    }
    const onTouchMove = (event: TouchEvent) => {
      if (body.scrollTop <= 0 && event.touches[0].clientY > startY) event.preventDefault()
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

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const body = bodyRef.current
    const fromBody = !!body && body.contains(event.target as Node)
    // 펼친 상태에서 본문을 스크롤 중이면 시트를 끌지 않는다.
    if (fromBody && stage === 'expanded' && body.scrollTop > 0) return
    const startOffset = getCurrentOffset(sheetRef.current)
    drag.current = {
      startY: event.clientY,
      startOffset,
      lastOffset: startOffset,
      fromBody,
      active: false,
      samples: [{ t: event.timeStamp, y: event.clientY }],
    }
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {}
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = drag.current
    if (!current) return
    const dy = event.clientY - current.startY
    if (!current.active) {
      if (Math.abs(dy) < DRAG_THRESHOLD) return
      // 펼친 상태에서 본문을 위로 미는 건 스크롤이지 시트 조작이 아니다.
      if (current.fromBody && stage === 'expanded' && dy < 0) {
        drag.current = null
        return
      }
      current.active = true
    }
    const { closed } = snapPoints()
    let offset = current.startOffset + dy
    if (offset < 0) offset *= RUBBER_BAND
    offset = Math.min(offset, closed)
    current.lastOffset = offset
    current.samples.push({ t: event.timeStamp, y: event.clientY })
    if (current.samples.length > 5) current.samples.shift()
    apply(offset, false)
  }

  const onPointerUp = () => {
    const current = drag.current
    drag.current = null
    if (!current || !current.active) return
    const points = snapPoints()
    const first = current.samples[0]
    const last = current.samples[current.samples.length - 1]
    const velocity = last.t > first.t ? (last.y - first.y) / (last.t - first.t) : 0
    const offset = current.lastOffset

    let next: SheetStage
    if (velocity > FLICK_VELOCITY) next = offset > points.peek ? 'closed' : 'peek'
    else if (velocity < -FLICK_VELOCITY) next = 'expanded'
    else {
      // 튕기지 않았으면 가장 가까운 단계로 붙인다.
      const stages: SheetStage[] = ['expanded', 'peek', 'closed']
      next = stages.reduce((best, candidate) =>
        Math.abs(points[candidate] - offset) < Math.abs(points[best] - offset) ? candidate : best,
      )
    }
    settle(next)
  }

  const title = shown ? itemTitle(shown, copy) : ''
  const name = shown ? itemName(shown, copy, lang) : ''

  return (
    <>
      <div
        ref={dimRef}
        className="absolute inset-0 z-[1090] bg-scrim/60 opacity-0 transition-opacity duration-300 motion-reduce:transition-none"
        style={{ pointerEvents: stage === 'expanded' ? 'auto' : 'none' }}
        onClick={() => setStage('peek')}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-label={title}
        aria-hidden={stage === 'closed'}
        className="absolute inset-x-0 bottom-0 z-[1100] flex h-[90%] touch-none flex-col rounded-t-panel border-t border-line bg-surface transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform motion-reduce:transition-none"
        style={{ transform: 'translateY(100%)' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          drag.current = null
          apply(snapPoints()[stage], true)
        }}
      >
        <div className="flex shrink-0 justify-center pt-2.5 pb-1.5">
          <div className="h-1 w-10 rounded-pill bg-line" />
        </div>
        <header className="flex shrink-0 items-start justify-between gap-4 px-5 pt-1 pb-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink-muted">{title}</p>
            <h2 className="truncate text-lg font-semibold">{name}</h2>
          </div>
          <button
            type="button"
            aria-label={copy.map.close}
            className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-surface-muted text-ink-muted"
            onClick={onClose}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              className="size-4"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>
        <div
          ref={bodyRef}
          className={`min-h-0 flex-1 px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-sm leading-6 ${
            stage === 'expanded'
              ? 'touch-pan-y overflow-y-auto overscroll-contain'
              : 'overflow-hidden'
          }`}
        >
          <dl className="grid grid-cols-[4.5rem_1fr] gap-y-2">
            {/* 쓰레기통은 여닫는 자리가 아니라 운영 시간 줄을 두지 않는다. */}
            {shown?.kind !== 'bin' && (
              <>
                <dt className="text-ink-muted">{copy.map.hours}</dt>
                <dd>{copy.map.hoursValue}</dd>
              </>
            )}
            {shown?.kind === 'booth' && (
              <>
                <dt className="text-ink-muted">{copy.map.location}</dt>
                <dd>{title}</dd>
                <dt className="text-ink-muted">{copy.map.host}</dt>
                <dd>{copy.map.hostValue}</dd>
              </>
            )}
          </dl>
          <div className="mt-5 flex h-[420px] items-center justify-center rounded-card border border-line bg-surface text-ink-muted">
            {copy.map.descriptionSlot}
          </div>
        </div>
      </div>
    </>
  )
}
