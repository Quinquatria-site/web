'use client'

import { animate, useMotionValue } from 'motion/react'
import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'

type Point = { x: number; y: number }
type Size = { width: number; height: number }

type Gesture =
  | { kind: 'idle' }
  // 확대 전 한 손가락. 움직인 방향을 보고 닫기 끌기인지 정한다
  | { kind: 'pending'; start: Point }
  | { kind: 'pan'; start: Point; x: number; y: number }
  | { kind: 'pinch'; distance: number; mid: Point; scale: number; x: number; y: number }
  | { kind: 'dismiss'; start: Point }
  // 확대 전 옆으로 밀어 다른 사진으로 넘기는 중. base 는 넘어가던 중에 잡은 자리
  | { kind: 'swipe'; start: Point; base: number }
  // 확대 전 위로 민 것처럼 아무것도 하지 않을 손짓
  | { kind: 'ignore' }

const MAX_SCALE = 4
const DOUBLE_TAP_SCALE = 2.5
// 손가락이 이만큼(px) 안 움직였으면 누른 것으로 본다
const TAP_SLOP = 10
const TAP_MS = 250
const DOUBLE_TAP_MS = 300
const DOUBLE_TAP_GAP = 40
// 이만큼(px) 내리거나 이 속도(px/s)로 튕기면 닫는다
const DISMISS_DISTANCE = 120
const DISMISS_VELOCITY = 800
// 가장자리 너머로 끌면 이 비율로만 따라와 고무줄처럼 버틴다
const RUBBER = 0.35
// 손을 뗀 속도로 이만큼(초) 더 미끄러진 자리에서 멈춘다
const PROJECTION = 0.15

const SETTLE = { type: 'spring', bounce: 0, duration: 0.4 } as const

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

// 범위를 넘은 만큼은 RUBBER 비율로 줄여 손가락보다 덜 따라오게 한다
function rubber(value: number, min: number, max: number) {
  if (value > max) return max + (value - max) * RUBBER
  if (value < min) return min + (value - min) * RUBBER
  return value
}

type Direction = 1 | -1

interface PinchZoomOptions {
  onDismiss: () => void
  /** 이 방향(1 은 다음)에 넘길 사진이 있는지. 주지 않으면 옆으로 넘기지 않는다 */
  canSwipe?: (direction: Direction) => boolean
  /** 옆으로 밀던 손을 뗐을 때. swipe 를 제자리로 돌릴지 넘길지는 부르는 쪽이 정한다 */
  onSwipeEnd?: (offset: number, velocity: number) => void
}

/** 사진 뷰어의 두 손가락 확대·끌어 보기·두 번 눌러 확대·아래로 내려 닫기·옆으로 넘기기. 화면 가운데 기준 x·y·scale 을 돌려준다 */
export function usePinchZoom(stageRef: RefObject<HTMLElement | null>, options: PinchZoomOptions) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)
  /** 아래로 내려 닫는 정도. 0 은 제자리, 1 은 거의 닫힘 */
  const dismiss = useMotionValue(0)
  /** 옆으로 민 거리. 확대 전에만 움직인다 */
  const swipe = useMotionValue(0)

  const pointers = useRef(new Map<number, Point>())
  const gesture = useRef<Gesture>({ kind: 'idle' })
  const natural = useRef<Size | null>(null)
  const tap = useRef<{ start: Point; time: number; moved: boolean } | null>(null)
  const lastTap = useRef<{ point: Point; time: number } | null>(null)
  const lastPinchMid = useRef<Point>({ x: 0, y: 0 })
  const closing = useRef(false)
  const optionsRef = useRef(options)

  useEffect(() => {
    optionsRef.current = options
  })

  const stageSize = (): Size => {
    const rect = stageRef.current?.getBoundingClientRect()
    return { width: rect?.width ?? 0, height: rect?.height ?? 0 }
  }

  // 화면 가운데를 0 으로 둔 손가락 위치. 확대 기준점이 가운데라 계산이 단순해진다
  const toStage = (clientX: number, clientY: number): Point => {
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: clientX - rect.left - rect.width / 2, y: clientY - rect.top - rect.height / 2 }
  }

  // object-contain 으로 화면에 맞춰 그려진 사진 크기. 끌 수 있는 범위가 여기서 나온다
  const fitted = (): Size => {
    const stage = stageSize()
    const img = natural.current
    if (!img || !img.width || !img.height) return stage
    const ratio = Math.min(stage.width / img.width, stage.height / img.height)
    return { width: img.width * ratio, height: img.height * ratio }
  }

  // 이 배율에서 사진이 화면 밖으로 넘친 만큼만 옮길 수 있다
  const bounds = (s: number) => {
    const stage = stageSize()
    const size = fitted()
    return {
      x: Math.max(0, (size.width * s - stage.width) / 2),
      y: Math.max(0, (size.height * s - stage.height) / 2),
    }
  }

  // 지금 배율·위치로 그려진 사진 위를 눌렀는지. 원본 크기를 모르면 화면 전체를 사진으로 본다
  const onPhoto = (point: Point) => {
    const size = fitted()
    const s = scale.get()
    return (
      Math.abs(point.x - x.get()) <= (size.width * s) / 2 &&
      Math.abs(point.y - y.get()) <= (size.height * s) / 2
    )
  }

  const stopAll = () => {
    x.stop()
    y.stop()
    scale.stop()
    dismiss.stop()
    swipe.stop()
  }

  const animateTo = (s: number, tx: number, ty: number, velocity?: Point) => {
    animate(scale, s, SETTLE)
    animate(x, tx, { ...SETTLE, velocity: velocity?.x ?? 0 })
    animate(y, ty, { ...SETTLE, velocity: velocity?.y ?? 0 })
    animate(dismiss, 0, SETTLE)
    // 넘어가던 사진을 누르기만 하고 떼면 제자리로 마저 붙인다
    animate(swipe, 0, SETTLE)
  }

  // 손을 다 떼면 배율을 1~MAX 안으로, 위치를 사진이 화면을 벗어나지 않는 범위로 되돌린다
  const settle = () => {
    const current = scale.get()
    const target = clamp(current, 1, MAX_SCALE)
    if (target === 1) return animateTo(1, 0, 0)
    let tx = x.get()
    let ty = y.get()
    if (target !== current) {
      // 너무 키웠다 놓으면 마지막 두 손가락 가운데를 붙든 채 줄어든다
      const anchor = lastPinchMid.current
      tx = anchor.x - ((anchor.x - tx) / current) * target
      ty = anchor.y - ((anchor.y - ty) / current) * target
    }
    const velocity = { x: x.getVelocity(), y: y.getVelocity() }
    const max = bounds(target)
    animateTo(
      target,
      clamp(tx + velocity.x * PROJECTION, -max.x, max.x),
      clamp(ty + velocity.y * PROJECTION, -max.y, max.y),
      velocity,
    )
  }

  const close = () => {
    if (closing.current) return
    closing.current = true
    // 내리던 방향 그대로 화면 밖으로 미끄러지며 닫힌다
    animate(y, y.get() + stageSize().height / 2, { type: 'tween', duration: 0.25, ease: 'easeIn' })
    optionsRef.current.onDismiss()
  }

  const zoomAt = (point: Point) => {
    if (scale.get() > 1.01) return animateTo(1, 0, 0)
    const max = bounds(DOUBLE_TAP_SCALE)
    // 누른 자리가 손가락 아래 그대로 남게 옮긴다
    animateTo(
      DOUBLE_TAP_SCALE,
      clamp(point.x * (1 - DOUBLE_TAP_SCALE), -max.x, max.x),
      clamp(point.y * (1 - DOUBLE_TAP_SCALE), -max.y, max.y),
    )
  }

  const startPinch = () => {
    const [a, b] = [...pointers.current.values()]
    gesture.current = {
      kind: 'pinch',
      distance: Math.max(Math.hypot(a.x - b.x, a.y - b.y), 1),
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      scale: scale.get(),
      x: x.get(),
      y: y.get(),
    }
    animate(dismiss, 0, SETTLE)
  }

  // 한 손가락으로 이어 갈 때 시작점을 지금 자리로 다시 잡아 사진이 튀지 않게 한다
  const startSingle = (point: Point) => {
    gesture.current =
      scale.get() > 1.01
        ? { kind: 'pan', start: point, x: x.get(), y: y.get() }
        : { kind: 'ignore' }
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (closing.current || (event.pointerType === 'mouse' && event.button !== 0)) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const point = toStage(event.clientX, event.clientY)
    pointers.current.set(event.pointerId, point)
    stopAll()

    if (pointers.current.size === 1) {
      tap.current = { start: point, time: event.timeStamp, moved: false }
      gesture.current =
        scale.get() > 1.01
          ? { kind: 'pan', start: point, x: x.get(), y: y.get() }
          : { kind: 'pending', start: point }
    } else if (pointers.current.size === 2) {
      if (tap.current) tap.current.moved = true
      startPinch()
    }
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!pointers.current.has(event.pointerId) || closing.current) return
    const point = toStage(event.clientX, event.clientY)
    pointers.current.set(event.pointerId, point)
    const g = gesture.current

    if (tap.current && !tap.current.moved) {
      const { start } = tap.current
      if (Math.hypot(point.x - start.x, point.y - start.y) > TAP_SLOP) tap.current.moved = true
    }

    if (g.kind === 'pinch' && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()]
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      const raw = (g.scale * Math.hypot(a.x - b.x, a.y - b.y)) / g.distance
      // 한계를 넘어 벌리거나 오므리면 점점 덜 따라와 놓았을 때 되돌아갈 것을 알린다
      const s =
        raw > MAX_SCALE
          ? MAX_SCALE * (raw / MAX_SCALE) ** RUBBER
          : raw < 1
            ? raw ** (1 / (1 + RUBBER))
            : raw
      lastPinchMid.current = mid
      // 처음 두 손가락 가운데 있던 사진 위의 점이 지금 가운데로 따라오게 한다
      x.set(mid.x - ((g.mid.x - g.x) / g.scale) * s)
      y.set(mid.y - ((g.mid.y - g.y) / g.scale) * s)
      scale.set(s)
      return
    }

    if (g.kind === 'pan') {
      const max = bounds(scale.get())
      // 핀치하다 범위 밖에서 한 손가락이 남으면 그 자리까지는 범위로 쳐야 첫 움직임에 튀지 않는다
      x.set(rubber(g.x + point.x - g.start.x, Math.min(-max.x, g.x), Math.max(max.x, g.x)))
      y.set(rubber(g.y + point.y - g.start.y, Math.min(-max.y, g.y), Math.max(max.y, g.y)))
      return
    }

    if (g.kind === 'pending') {
      const dx = point.x - g.start.x
      const dy = point.y - g.start.y
      if (Math.hypot(dx, dy) <= TAP_SLOP) return
      // 아래로 내리면 닫기, 넘길 사진이 있을 때 옆으로 밀면 넘기기다. 위로 민 것은 흘려보낸다
      gesture.current =
        dy > 0 && dy > Math.abs(dx)
          ? { kind: 'dismiss', start: g.start }
          : Math.abs(dx) >= Math.abs(dy) && optionsRef.current.canSwipe
            ? { kind: 'swipe', start: g.start, base: swipe.get() }
            : { kind: 'ignore' }
    }

    if (gesture.current.kind === 'swipe') {
      const { start, base } = gesture.current
      const dx = base + point.x - start.x
      // 처음·마지막 사진에서 더 밀면 고무줄처럼 버틴다
      swipe.set(optionsRef.current.canSwipe?.(dx < 0 ? 1 : -1) ? dx : dx * RUBBER)
      return
    }

    if (gesture.current.kind === 'dismiss') {
      const { start } = gesture.current
      const dy = point.y - start.y
      // 위로 되돌려 올리면 제자리보다 위로는 조금만 따라온다
      const ty = dy > 0 ? dy : dy * RUBBER
      const progress = clamp(ty / (stageSize().height * 0.4 || 1), 0, 1)
      x.set(point.x - start.x)
      y.set(ty)
      scale.set(1 - progress * 0.25)
      dismiss.set(progress)
    }
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (!pointers.current.delete(event.pointerId) || closing.current) return
    const g = gesture.current

    if (pointers.current.size === 1) {
      // 두 손가락 중 하나만 떼면 남은 손가락으로 이어서 끈다
      if (g.kind === 'pinch') startSingle([...pointers.current.values()][0])
      return
    }
    if (pointers.current.size > 1) {
      startPinch()
      return
    }

    gesture.current = { kind: 'idle' }
    const point = toStage(event.clientX, event.clientY)
    const t = tap.current
    tap.current = null

    if (g.kind === 'swipe') {
      const cancelled = event.type === 'pointercancel'
      return optionsRef.current.onSwipeEnd?.(
        cancelled ? 0 : swipe.get(),
        cancelled ? 0 : swipe.getVelocity(),
      )
    }

    if (g.kind === 'dismiss') {
      if (
        event.type !== 'pointercancel' &&
        (y.get() > DISMISS_DISTANCE || y.getVelocity() > DISMISS_VELOCITY)
      )
        return close()
      return animateTo(1, 0, 0)
    }

    if (event.type !== 'pointercancel' && t && !t.moved && event.timeStamp - t.time < TAP_MS) {
      // 확대했든 아니든 사진 밖 빈 배경을 누르면 닫는다
      if (!onPhoto(point)) {
        closing.current = true
        return optionsRef.current.onDismiss()
      }
      const last = lastTap.current
      if (
        last &&
        event.timeStamp - last.time < DOUBLE_TAP_MS &&
        Math.hypot(point.x - last.point.x, point.y - last.point.y) < DOUBLE_TAP_GAP
      ) {
        lastTap.current = null
        return zoomAt(point)
      }
      lastTap.current = { point, time: event.timeStamp }
    }
    settle()
  }

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    // React 의 onWheel 은 passive 라 막을 수 없어 직접 단다. 막지 않으면 뒤 페이지가 굴러가거나 브라우저가 확대된다
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      if (closing.current) return
      const point = toStage(event.clientX, event.clientY)
      const current = scale.get()

      if (event.ctrlKey) {
        // 트랙패드 두 손가락 벌리기와 Ctrl+휠은 ctrlKey 가 붙은 휠로 온다
        const next = clamp(current * Math.exp(-event.deltaY * 0.01), 1, MAX_SCALE)
        const max = bounds(next)
        stopAll()
        x.set(clamp(point.x - ((point.x - x.get()) / current) * next, -max.x, max.x))
        y.set(clamp(point.y - ((point.y - y.get()) / current) * next, -max.y, max.y))
        scale.set(next)
        return
      }

      // 확대했을 때만 굴려서 옮기고, 확대 전 휠은 뒤 페이지로 새지 않게 막기만 한다
      if (current > 1.01) {
        const max = bounds(current)
        stopAll()
        x.set(clamp(x.get() - event.deltaX, -max.x, max.x))
        y.set(clamp(y.get() - event.deltaY, -max.y, max.y))
      }
    }

    // iOS Safari 는 touch-action 과 별개로 gesture 이벤트로 페이지를 확대하려 해 막는다
    const preventGesture = (event: Event) => event.preventDefault()

    // 화면을 돌리거나 창 크기가 바뀌면 사진이 범위를 벗어나지 않게 다시 맞춘다
    const handleResize = () => {
      if (!closing.current && pointers.current.size === 0) settle()
    }

    stage.addEventListener('wheel', handleWheel, { passive: false })
    stage.addEventListener('gesturestart', preventGesture)
    stage.addEventListener('gesturechange', preventGesture)
    window.addEventListener('resize', handleResize)
    return () => {
      stage.removeEventListener('wheel', handleWheel)
      stage.removeEventListener('gesturestart', preventGesture)
      stage.removeEventListener('gesturechange', preventGesture)
      window.removeEventListener('resize', handleResize)
    }
    // 이벤트 안에서 쓰는 값은 모두 ref·motion value 라 처음 한 번만 단다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageRef])

  /** 원본 크기를 알아야 끌 수 있는 범위를 맞게 잡는다 */
  const setNaturalSize = (size: Size | null) => {
    natural.current = size
  }

  /** 다른 사진으로 넘어가면 배율·위치를 처음으로 되돌린다 */
  const reset = (size: Size | null) => {
    stopAll()
    x.set(0)
    y.set(0)
    scale.set(1)
    natural.current = size
    lastTap.current = null
  }

  const handlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
  }

  return { x, y, scale, dismiss, swipe, handlers, setNaturalSize, reset }
}
