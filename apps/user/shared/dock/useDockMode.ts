'use client'

import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'
import { getDockMode } from './dock-mode'
import { landingStore } from './landing-store'

/** 현재 주소와 스크롤 상태로 계산한 도크 모드 */
export function useDockMode() {
  const pathname = usePathname()
  // 정적 HTML 은 랜딩 최상단 기준으로 그려야 하므로 서버 값은 false
  const pastLanding = useSyncExternalStore(landingStore.subscribe, landingStore.get, () => false)
  return getDockMode(pathname, pastLanding)
}
