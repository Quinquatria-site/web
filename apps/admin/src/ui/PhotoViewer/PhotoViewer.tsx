import IconXmarkLine from '@karrotmarket/react-monochrome-icon/IconXmarkLine'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { PORTAL_HOST_ID } from '../../app/AppLayout'
import { imageSrc } from '../../lib/imageSrc'
import styles from './PhotoViewer.module.css'

const MIN_SCALE = 1
const MAX_SCALE = 4
/** 더블 탭으로 갈 배율 */
const DOUBLE_TAP_SCALE = 2.5
/** 이만큼 내리고 놓으면 닫는다 */
const DISMISS_PX = 120
const DOUBLE_TAP_MS = 300

type Transform = { scale: number; tx: number; ty: number }
const IDENTITY: Transform = { scale: 1, tx: 0, ty: 0 }

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

export interface PhotoViewerProps {
  /** 열 이미지의 S3 key. null 이면 닫힘 */
  uri: string | null
  onClose: () => void
  /** 접근성 이름 */
  label: string
}

/**
 * 사진 한 장을 크게 본다. 핀치로 확대하고 아래로 내려서 닫는다.
 *
 * SEED 에 뷰어·갤러리가 없어 직접 만든다 — ImageFrame 은 비율 고정 이미지일 뿐이다.
 * 하단 탭바·시트와 같은 판단이다.
 *
 * 폰 기둥(480px) 안에 가두지 않는다. 크게 보는 것이 목적이라 좁힐 이유가 없다.
 */
export function PhotoViewer({ uri, onClose, label }: PhotoViewerProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [transform, setTransform] = useState<Transform>(IDENTITY)
  // 내려서 닫는 중의 이동량. 배경을 같이 흐리게 한다
  const [dismissY, setDismissY] = useState(0)
  const [animating, setAnimating] = useState(false)

  /** 진행 중인 포인터들. 2개가 되면 핀치다 */
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<{
    startDist: number
    startScale: number
    startTx: number
    startTy: number
    midX: number
    midY: number
  } | null>(null)
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)
  const lastTap = useRef(0)

  const open = uri !== null

  /* 열릴 때 포커스를 가져온다. Escape 를 window 가 아니라 이 노드에서 받기 때문이다.
     상태 초기화는 여기서 하지 않는다 — 호출부가 key 로 리마운트시켜서 배율·위치가
     매번 처음부터 시작한다 */
  useEffect(() => {
    if (open) overlayRef.current?.focus()
  }, [open])

  /** 확대한 만큼만 움직이게 자른다. 이미지 밖 여백이 보이면 안 된다 */
  const clampOffset = useCallback((next: Transform): Transform => {
    const image = imageRef.current
    const stage = stageRef.current
    if (!image || !stage || next.scale <= 1) return { ...next, tx: 0, ty: 0 }
    const maxX = Math.max(0, (image.clientWidth * next.scale - stage.clientWidth) / 2)
    const maxY = Math.max(0, (image.clientHeight * next.scale - stage.clientHeight) / 2)
    return { ...next, tx: clamp(next.tx, -maxX, maxX), ty: clamp(next.ty, -maxY, maxY) }
  }, [])

  /** 한 점을 고정한 채 배율만 바꾼다. 핀치 중점·더블 탭 지점이 제자리에 남는다 */
  const zoomAt = useCallback(
    (nextScale: number, clientX: number, clientY: number, base: Transform) => {
      const stage = stageRef.current
      if (!stage) return
      const rect = stage.getBoundingClientRect()
      const cx = clientX - rect.left - rect.width / 2
      const cy = clientY - rect.top - rect.height / 2
      const scale = clamp(nextScale, MIN_SCALE, MAX_SCALE)
      const ratio = scale / base.scale
      setTransform(
        clampOffset({
          scale,
          tx: cx - (cx - base.tx) * ratio,
          ty: cy - (cy - base.ty) * ratio,
        }),
      )
    },
    [clampOffset],
  )

  const onPointerDown = (event: React.PointerEvent) => {
    // 손가락이 이미 떨어졌거나 노드가 빠진 뒤면 던진다. 잡아두지 못해도 제스처는 돈다
    try {
      ;(event.target as Element).setPointerCapture(event.pointerId)
    } catch {
      /* 무시 */
    }
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    setAnimating(false)

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      gesture.current = {
        startDist: Math.hypot(a.x - b.x, a.y - b.y),
        startScale: transform.scale,
        startTx: transform.tx,
        startTy: transform.ty,
        midX: (a.x + b.x) / 2,
        midY: (a.y + b.y) / 2,
      }
      drag.current = null
      return
    }

    if (pointers.current.size === 1) {
      const now = Date.now()
      if (now - lastTap.current < DOUBLE_TAP_MS) {
        lastTap.current = 0
        setAnimating(true)
        if (transform.scale > 1) setTransform(IDENTITY)
        else zoomAt(DOUBLE_TAP_SCALE, event.clientX, event.clientY, transform)
        return
      }
      lastTap.current = now
      drag.current = { x: event.clientX, y: event.clientY, tx: transform.tx, ty: transform.ty }
    }
  }

  const onPointerMove = (event: React.PointerEvent) => {
    if (!pointers.current.has(event.pointerId)) return
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (pointers.current.size === 2 && gesture.current) {
      const [a, b] = [...pointers.current.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      const g = gesture.current
      zoomAt(g.startScale * (dist / g.startDist), g.midX, g.midY, {
        scale: g.startScale,
        tx: g.startTx,
        ty: g.startTy,
      })
      return
    }

    const d = drag.current
    if (!d || pointers.current.size !== 1) return
    const dx = event.clientX - d.x
    const dy = event.clientY - d.y

    if (transform.scale > 1) {
      // 확대 상태에서는 팬이 우선이다. 아니면 아래를 보려는 동작이 닫기로 오인된다
      setTransform((prev) => clampOffset({ ...prev, tx: d.tx + dx, ty: d.ty + dy }))
      return
    }
    // 1× 에서는 내려서 닫기. 위로는 고무줄처럼 덜 따라간다
    setDismissY(dy > 0 ? dy : dy * 0.2)
  }

  const endPointer = (event: React.PointerEvent) => {
    pointers.current.delete(event.pointerId)
    if (pointers.current.size < 2) gesture.current = null

    if (pointers.current.size === 0) {
      drag.current = null
      if (dismissY > DISMISS_PX) return onClose()
      if (dismissY !== 0) {
        setAnimating(true)
        setDismissY(0)
      }
      if (transform.scale <= 1 && (transform.tx !== 0 || transform.ty !== 0)) {
        setAnimating(true)
        setTransform(IDENTITY)
      }
    }
  }

  /* 트랙패드 핀치는 ctrlKey 가 붙은 wheel 로 온다. 데스크톱 확인에도 쓴다.
     preventDefault 가 필요해 passive: false 로 직접 단다 — React 의 onWheel 은 passive 다 */
  useEffect(() => {
    const stage = stageRef.current
    if (!stage || !open) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      setAnimating(false)
      setTransform((prev) => {
        const next = clamp(prev.scale * (event.deltaY < 0 ? 1.15 : 1 / 1.15), MIN_SCALE, MAX_SCALE)
        const rect = stage.getBoundingClientRect()
        const cx = event.clientX - rect.left - rect.width / 2
        const cy = event.clientY - rect.top - rect.height / 2
        const ratio = next / prev.scale
        return clampOffset({
          scale: next,
          tx: cx - (cx - prev.tx) * ratio,
          ty: cy - (cy - prev.ty) * ratio,
        })
      })
    }
    stage.addEventListener('wheel', onWheel, { passive: false })
    return () => stage.removeEventListener('wheel', onWheel)
  }, [open, clampOffset])

  if (!open) return null

  const progress = Math.min(1, Math.abs(dismissY) / (DISMISS_PX * 2))

  /* 지도 시트는 슬라이드 때문에 transform 을 쓴다. transform 이 걸린 조상은
     position: fixed 의 기준이 되므로, 그 안에서 그리면 시트 크기에 갇힌다.
     기둥(.page) 바로 밑으로 빼서 창 기준으로 눕힌다 */
  return createPortal(
    // Escape 를 여기서 받고 막는다. window 로 올라가면 지도 시트까지 같이 닫힌다
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`${label} 사진 크게 보기`}
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return
        event.stopPropagation()
        onClose()
      }}
      style={{ background: `rgb(0 0 0 / ${0.92 - progress * 0.6})` }}
    >
      <button type="button" className={styles.close} aria-label="닫기" onClick={onClose}>
        <IconXmarkLine width={24} height={24} />
      </button>

      <div
        ref={stageRef}
        className={styles.stage}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
      >
        <img
          ref={imageRef}
          className={animating ? `${styles.image} ${styles.animating}` : styles.image}
          src={imageSrc(uri)}
          alt={label}
          draggable={false}
          style={{
            transform: `translate(${transform.tx}px, ${transform.ty + dismissY}px) scale(${transform.scale})`,
          }}
          onTransitionEnd={() => setAnimating(false)}
        />
      </div>
    </div>,
    document.getElementById(PORTAL_HOST_ID) ?? document.body,
  )
}
