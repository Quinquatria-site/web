'use client'

import { useEffect, useId, useRef } from 'react'

/** 열려 있는 동안 방문 기록을 하나 쌓아, 뒤로 가기가 페이지 대신 시트를 닫게 한다 */
export function useCloseOnBack(open: boolean, onClose: () => void) {
  const key = useId()
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return

    // 주소는 그대로 두고 기록만 쌓는다. Next 가 pushState 를 감싸 라우터 상태를 함께 옮겨 준다
    window.history.pushState({ bottomSheet: key }, '')
    let popped = false
    const handlePopState = () => {
      popped = true
      onCloseRef.current()
    }
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      // X·끌기·ESC 로 닫혔으면 쌓은 기록을 걷는다. 링크로 다른 페이지에 갔으면 맨 위가 남의 기록이라 건드리지 않는다
      if (!popped && window.history.state?.bottomSheet === key) window.history.back()
    }
  }, [open, key])
}
