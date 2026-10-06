'use client'

import { useEffect, useId, useRef } from 'react'
import { supportsCloseWatcher, watchClose } from './close-watcher'

// 닫힌 층이 걷으려고 미뤄 둔 기록. 같은 렌더에 다른 층이 열리면 그 층이 기록을 물려받는다
let releasing: { cancel: () => void } | null = null

/** 열려 있는 동안 뒤로 가기가 페이지 대신 시트·뷰어를 닫게 한다. CloseWatcher 가 있으면 그것으로, 없으면 방문 기록을 하나 쌓아서. 겹쳐 열면 맨 위부터 하나씩 닫힌다 */
export function useCloseOnBack(open: boolean, onClose: () => void) {
  const key = useId()
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return
    // 기록 없이 뒤로 가기를 받을 수 있으면 그쪽을 써서, CloseWatcher 로 닫는 장소 시트 위에 겹쳐도 맨 위부터 닫힌다
    if (supportsCloseWatcher()) return watchClose(() => onCloseRef.current())

    // 주소는 그대로 두고 기록만 쌓는다. Next 가 pushState 를 감싸 라우터 상태를 함께 옮겨 준다
    // 뒤로 가기는 늦게 돌아서, 방금 닫힌 층 기록을 걷고 새로 쌓으면 그 뒤로 가기가 새 기록을 걷어 이 층이 바로 닫힌다
    if (releasing) {
      releasing.cancel()
      releasing = null
      window.history.replaceState({ closeOnBack: key }, '')
    } else {
      window.history.pushState({ closeOnBack: key }, '')
    }
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
      if (popped || window.history.state?.closeOnBack !== key) return
      // 같은 렌더에 열리는 층이 물려받을 수 있게 한 박자 미룬다
      let cancelled = false
      const release = {
        cancel: () => {
          cancelled = true
        },
      }
      releasing = release
      queueMicrotask(() => {
        if (releasing === release) releasing = null
        if (!cancelled) window.history.back()
      })
    }
  }, [open, key])
}
