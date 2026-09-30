import { useCallback, useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import { apiErrorText } from '../lib/apiErrorText'
import { loadCatalog, loadNotices, loadPerformances } from '../mocks/store'
import styles from './DataGate.module.css'

/** 창에 돌아올 때 다시 받는 최소 간격 */
const REFRESH_INTERVAL_MS = 30_000

type GateState = { kind: 'loading' } | { kind: 'ready' } | { kind: 'error'; message: string }

/**
 * 로그인한 화면들 앞의 입구. 서버 데이터를 받아 스토어 캐시를 채운 뒤에 화면을 연다.
 *
 * 화면들은 스토어를 렌더 중에 동기로 읽는다. 받기 전에 열면 빈 목록을 "공지 없음" 으로
 * 잘못 말하므로, 첫 로드가 끝날 때까지 자식을 그리지 않는다.
 *
 * 창에 돌아올 때(`focus`·`visibilitychange`) 조용히 다시 받는다 — 여러 운영자가 동시에
 * 올려도 탭을 오가면 맞춰진다. 폴링은 하지 않는다(useHealth 와 같은 이유). 다시 받기가
 * 실패하면 화면을 막지 않고 있던 캐시를 그대로 둔다. 실패는 오류 기록에 남는다.
 *
 * 지금은 공지·카탈로그(카테고리·장소·메뉴)·공연을 받는다. 도메인을 API 로 옮길 때마다
 * load 에 하나씩 더한다.
 */
export function DataGate() {
  const [state, setState] = useState<GateState>({ kind: 'loading' })
  const lastRunAt = useRef(0)
  const loaded = useRef(false)
  const mounted = useRef(true)

  /**
   * 받아서 캐시를 채우고, 화면이 옮겨갈 상태를 돌려준다. 바꿀 게 없으면 null.
   * 상태는 여기서 직접 바꾸지 않고 호출부가 응답 뒤에 반영한다 — effect 안에서
   * 곧바로 setState 하면 렌더가 연쇄로 돈다(React 컴파일러 규칙).
   */
  const load = useCallback(async (force: boolean): Promise<GateState | null> => {
    const now = Date.now()
    if (!force && now - lastRunAt.current < REFRESH_INTERVAL_MS) return null
    lastRunAt.current = now

    try {
      await Promise.all([loadNotices(), loadCatalog(), loadPerformances()])
      loaded.current = true
      return { kind: 'ready' }
    } catch (error) {
      // 한 번 받은 뒤의 실패는 화면을 막지 않는다
      return loaded.current ? null : { kind: 'error', message: apiErrorText(error) }
    }
  }, [])

  const apply = useCallback((next: GateState | null) => {
    if (next && mounted.current) setState(next)
  }, [])

  useEffect(() => {
    mounted.current = true
    // StrictMode 가 effect 를 두 번 걸어도 간격 제한이 두 번째를 막는다 (useHealth 와 같다)
    void load(false).then(apply)

    const onWake = () => {
      if (document.visibilityState === 'visible') void load(false).then(apply)
    }
    window.addEventListener('focus', onWake)
    document.addEventListener('visibilitychange', onWake)
    return () => {
      mounted.current = false
      window.removeEventListener('focus', onWake)
      document.removeEventListener('visibilitychange', onWake)
    }
  }, [load, apply])

  if (state.kind === 'loading') {
    return (
      <div className={styles.center}>
        <p className={styles.body}>불러오는 중…</p>
      </div>
    )
  }

  if (state.kind === 'error') {
    return (
      <div className={styles.center}>
        <h2 className={styles.title}>데이터를 불러오지 못했습니다</h2>
        <p className={styles.body}>{state.message}</p>
        <ActionButton
          variant="neutralWeak"
          onClick={() => {
            setState({ kind: 'loading' })
            void load(true).then(apply)
          }}
        >
          다시 시도
        </ActionButton>
      </div>
    )
  }

  return <Outlet />
}
