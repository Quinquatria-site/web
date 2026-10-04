'use client'

import { useCallback, useEffect, useState } from 'react'

// 도크처럼 fixed 로 바닥에 붙은 요소가 줄어든 만큼 다시 내려가도록 <html> 에 쓰는 변수
const SHIFT_VAR = '--keyboard-shift'

/** 검색 키보드가 떠 있는 동안 화면 높이를 잠근다. iOS 는 키보드로 레이아웃 뷰포트를 줄여 바닥에 붙은 UI 가 딸려 올라와서, 잠긴 높이와 줄어든 높이의 차이를 --keyboard-shift 로 알려 제자리에 둔다 */
export function useKeyboardLock() {
  const [lockedHeight, setLockedHeight] = useState<number | null>(null)

  // 키보드가 뜨기 전, 검색 막대 누름 안에서 불러야 원래 높이를 잰다
  const lock = useCallback(() => setLockedHeight(document.documentElement.clientHeight), [])
  const unlock = useCallback(() => setLockedHeight(null), [])

  useEffect(() => {
    if (lockedHeight === null) return
    const root = document.documentElement
    // fixed 요소의 기준인 레이아웃 뷰포트 높이로 잰다. 안 줄어드는 브라우저(안드로이드 크롬 기본)는 0 이다
    const update = () =>
      root.style.setProperty(SHIFT_VAR, `${Math.max(0, lockedHeight - root.clientHeight)}px`)
    update()
    addEventListener('resize', update)
    visualViewport?.addEventListener('resize', update)
    return () => {
      removeEventListener('resize', update)
      visualViewport?.removeEventListener('resize', update)
      root.style.removeProperty(SHIFT_VAR)
    }
  }, [lockedHeight])

  return { lockedHeight, lock, unlock }
}
