import {
  IconChevronRightSmallLine,
  IconExclamationmarkCircleFill,
} from '@karrotmarket/react-monochrome-icon'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { isErrorSurfaced, subscribeNewErrors, type ErrorLogEntry } from '../../lib/errorLog'
import styles from './ErrorBanner.module.css'

/** 이만큼 보이고 사라진다. 누르고 있는 동안은 멈춘다 */
const VISIBLE_MS = 4000

/**
 * 기록되고 나서 이만큼 기다렸다가 띄운다. 그 사이 화면이 apiErrorText 로 오류를 직접
 * 알렸으면(저장 실패 문구·스낵바) 건너뛴다. 요청 실패 → throw → catch 는 한 번에
 * 이어지므로 짧아도 충분하다.
 */
const GRACE_MS = 500

/** 위로 이만큼 쓸어 올리면 닫는다 */
const SWIPE_CLOSE_PX = 32

/** 이보다 덜 움직였으면 누른 것으로 본다 */
const TAP_SLOP_PX = 8

export interface ErrorBannerProps {
  /** false 면 띄우지 않고, 이미 떠 있던 것도 내린다. 로그인·설정 화면 */
  enabled: boolean
  /** 배너를 눌렀을 때. 설정 › 오류 기록으로 보낸다 */
  onOpen: (entry: ErrorLogEntry) => void
}

interface Shown {
  entry: ErrorLogEntry
  /** 이번에 떠 있는 동안 쌓인 건수 */
  count: number
}

/**
 * 화면이 직접 알리지 않은 오류를 휴대폰 푸시 알림처럼 위에서 잠깐 띄운다.
 *
 * 오류 기록은 설정 깊숙이 있어서, 백그라운드 새로고침 실패나 잡히지 않은 화면 오류는
 * 운영자가 모르고 지나간다. 저장 실패처럼 화면이 이미 말한 것은 띄우지 않는다 —
 * 아래 스낵바와 위 알림이 한꺼번에 뜨면 시끄럽다.
 *
 * 연달아 나면 카드를 쌓지 않고 한 장을 고쳐 쓴다. 서버가 죽으면 요청 여러 개가
 * 동시에 실패하는데, 그때 카드가 줄줄이 내려오면 화면을 덮는다.
 */
export function ErrorBanner({ enabled, onOpen }: ErrorBannerProps) {
  const [shown, setShown] = useState<Shown | null>(null)
  const [paused, setPaused] = useState(false)
  const [dragY, setDragY] = useState(0)
  const drag = useRef<{ startY: number; moved: boolean } | null>(null)

  // 꺼져 있는 동안(로그인·설정 화면)은 듣지 않는다. 그 사이 난 오류는 기록에만 남는다
  useEffect(() => {
    if (!enabled) return
    const timers = new Set<number>()
    const unsubscribe = subscribeNewErrors((entry) => {
      // 토큰 만료는 곧 로그인 화면으로 넘어간다. 알림이 따라갈 곳이 없다
      if (entry.code === 'INVALID_TOKEN') return
      const timer = window.setTimeout(() => {
        timers.delete(timer)
        if (isErrorSurfaced(entry.id)) return
        setShown((prev) => ({ entry, count: (prev?.count ?? 0) + 1 }))
      }, GRACE_MS)
      timers.add(timer)
    })
    return () => {
      unsubscribe()
      for (const timer of timers) window.clearTimeout(timer)
    }
  }, [enabled])

  // 새 오류가 오면 shown 이 바뀌어 타이머가 처음부터 다시 돈다.
  // 꺼지면 바로 내린다 — 설정에 갔다가 4초 안에 돌아왔을 때 지난 알림이 다시 보이면 안 된다
  useEffect(() => {
    if (!shown || (enabled && paused)) return
    const timer = window.setTimeout(() => setShown(null), enabled ? VISIBLE_MS : 0)
    return () => window.clearTimeout(timer)
  }, [shown, paused, enabled])

  if (!shown || !enabled) return null
  const { entry, count } = shown

  const close = () => {
    setShown(null)
    setDragY(0)
    setPaused(false)
  }

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    drag.current = { startY: event.clientY, moved: false }
    setPaused(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return
    const dy = event.clientY - drag.current.startY
    if (Math.abs(dy) > TAP_SLOP_PX) drag.current.moved = true
    // 아래로는 끌려 내려오지 않는다. 위로만 따라간다
    setDragY(Math.min(dy, 0))
  }

  const onPointerUp = () => {
    const current = drag.current
    drag.current = null
    setPaused(false)
    if (!current) return
    if (dragY <= -SWIPE_CLOSE_PX) {
      close()
      return
    }
    setDragY(0)
    if (!current.moved) {
      close()
      onOpen(entry)
    }
  }

  const onPointerCancel = () => {
    drag.current = null
    setPaused(false)
    setDragY(0)
  }

  const summary =
    entry.kind === 'api'
      ? `${entry.title} · ${entry.status || '연결 실패'}${entry.code ? ` ${entry.code}` : ''}`
      : entry.message

  return (
    <div className={styles.host} role="status" aria-live="polite">
      <button
        // 새 오류마다 다시 마운트해 내려오는 움직임을 한 번 더 보여준다
        key={entry.id}
        type="button"
        className={styles.banner}
        style={dragY ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onKeyDown={(event) => {
          if (event.key === 'Escape') close()
        }}
        onClick={(event) => {
          // 포인터는 onPointerUp 이 처리했다. 키보드(Enter·Space)로 누른 것만 여기서 받는다
          if (event.detail !== 0) return
          close()
          onOpen(entry)
        }}
        aria-label={`오류가 났습니다${count > 1 ? ` ${count}건` : ''}. ${summary}. 눌러서 오류 기록 보기`}
      >
        <IconExclamationmarkCircleFill className={styles.icon} width={20} height={20} />
        <span className={styles.text}>
          <span className={styles.heading}>
            {count > 1 ? `오류가 ${count}건 났습니다` : '오류가 났습니다'}
          </span>
          <span className={styles.summary}>{summary}</span>
        </span>
        <IconChevronRightSmallLine className={styles.chevron} width={16} height={16} />
      </button>
    </div>
  )
}
