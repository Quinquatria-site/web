'use client'

import { useEffect, useRef } from 'react'
import { watchClose } from './close-watcher'

/** 열려 있는 동안 안드로이드 뒤로 가기·Esc 로 닫는다. 기록을 쌓지 않아, 지원하지 않는 브라우저에선 뒤로 가기가 그냥 이전 페이지로 간다 */
export function useCloseWatcher(open: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return
    return watchClose(() => onCloseRef.current())
  }, [open])
}
