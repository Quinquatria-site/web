'use client'

import { useEffect, useId, useRef } from 'react'

/** 열려 있는 동안 방문 기록을 하나 쌓아, 뒤로 가기가 페이지 대신 시트·뷰어를 닫게 한다. 겹쳐 열면 맨 위부터 하나씩 닫힌다 */
export function useCloseOnBack(open: boolean, onClose: () => void) {
  const key = useId()
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return

    // 주소는 그대로 두고 기록만 쌓는다. Next 가 pushState 를 감싸 라우터 상태를 함께 옮겨 준다
    window.history.pushState({ closeOnBack: key }, '')
    let popped = false
    const handlePopState = () => {
      // 위에 겹친 층의 기록만 걷혀 내 기록으로 돌아온 것이라 나는 그대로 둔다
      if (window.history.state?.closeOnBack === key) return
      popped = true
      onCloseRef.current()
    }
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      // X·끌기·ESC 로 닫혔으면 쌓은 기록을 걷는다. 링크로 다른 페이지에 갔으면 맨 위가 남의 기록이라 건드리지 않는다
      if (!popped && window.history.state?.closeOnBack === key) window.history.back()
    }
  }, [open, key])
}
