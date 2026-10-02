'use client'

import { useEffect } from 'react'
import { escapeTargets } from './escape-targets'

/** 한 탭에서 한 번만 시도하게 막는 sessionStorage 키. 라인 출구처럼 같은 페이지를 다시 여는 시도가 무한히 돌지 않게 한다 */
const TRIED_KEY = 'in-app-escape-tried'

/** 이 시간 안에 화면이 가려지지 않으면 앞 시도가 실패한 것으로 보고 다음 주소로 넘어간다 */
const STEP_MS = 1500

/** 인앱 브라우저로 들어오면 크롬, 없으면 기본 브라우저로 내보낸다. 전부 막히면 인앱에 그대로 둔다 */
export function InAppEscape() {
  useEffect(() => {
    const targets = escapeTargets(navigator.userAgent, window.location.href)
    if (targets.length === 0) return
    try {
      if (sessionStorage.getItem(TRIED_KEY)) return
      sessionStorage.setItem(TRIED_KEY, '1')
    } catch {
      // 기록을 못 남기면 반복을 막을 수 없어 시도하지 않는다
      return
    }

    let step = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    const tryNext = () => {
      if (step >= targets.length) return
      window.location.href = targets[step++]
      timer = setTimeout(tryNext, STEP_MS)
    }
    // 다른 앱이 열리면 인앱 화면이 가려진다. 돌아왔을 때 남은 시도가 이어지지 않게 멈춘다
    const stop = () => {
      if (document.visibilityState === 'hidden') clearTimeout(timer)
    }

    document.addEventListener('visibilitychange', stop)
    tryNext()
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', stop)
    }
  }, [])

  return null
}
