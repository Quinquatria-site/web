'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// 도크처럼 fixed 로 바닥에 붙은 요소가 줄어든 만큼 다시 내려가도록 <html> 에 쓰는 변수
const SHIFT_VAR = '--keyboard-shift'

// 키보드가 내려가며 화면이 원래 높이로 돌아오지 않아도(외장 키보드 등) 이만큼 뒤엔 푼다
const RELEASE_TIMEOUT = 1000

/** 검색 키보드가 떠 있는 동안 화면 높이를 잠근다. iOS 는 키보드로 레이아웃 뷰포트를 줄여 바닥에 붙은 fixed UI 가 딸려 올라와서, 잠긴 높이와 줄어든 높이의 차이를 --keyboard-shift 로 알려 제자리(키보드 뒤)에 둔다 */
export function useKeyboardLock() {
  const [lockedHeight, setLockedHeight] = useState<number | null>(null)
  // 닫기를 받은 뒤 키보드가 다 내려가길 기다리는 중
  const releasingRef = useRef(false)
  const fallbackRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // 키보드가 뜨기 전, 검색 막대 누름 안에서 불러야 원래 높이를 잰다. 내려가는 중에 다시 열면 줄어든 높이를 재지 않게 잠긴 값을 그대로 쓴다
  const lock = useCallback(() => {
    releasingRef.current = false
    clearTimeout(fallbackRef.current)
    setLockedHeight((height) => height ?? document.documentElement.clientHeight)
  }, [])
  // 바로 풀면 아직 줄어 있는 화면에 지도·도크가 붙었다가 키보드가 내려가며 다시 늘어 깜빡여서, 화면이 원래 높이로 돌아온 뒤에 푼다
  const unlock = useCallback(() => {
    releasingRef.current = true
    clearTimeout(fallbackRef.current)
    fallbackRef.current = setTimeout(() => setLockedHeight(null), RELEASE_TIMEOUT)
    setLockedHeight((height) =>
      height !== null && document.documentElement.clientHeight < height ? height : null,
    )
  }, [])

  useEffect(() => {
    if (lockedHeight === null) return
    const root = document.documentElement
    // fixed 요소의 기준인 레이아웃 뷰포트 높이로 잰다. 안 줄어드는 브라우저(안드로이드 크롬 기본)는 0 이다
    const update = () => {
      if (releasingRef.current && root.clientHeight >= lockedHeight) return setLockedHeight(null)
      root.style.setProperty(SHIFT_VAR, `${Math.max(0, lockedHeight - root.clientHeight)}px`)
    }
    update()
    addEventListener('resize', update)
    visualViewport?.addEventListener('resize', update)
    return () => {
      removeEventListener('resize', update)
      visualViewport?.removeEventListener('resize', update)
      root.style.removeProperty(SHIFT_VAR)
    }
  }, [lockedHeight])

  useEffect(() => () => clearTimeout(fallbackRef.current), [])

  return { locked: lockedHeight !== null, lock, unlock }
}
