import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { configureClient } from '../api'
import { AuthContext, type LoginResult } from './authContext'
import { issueToken, type IssuedToken } from './issueToken'

/**
 * access token 과 만료 시각을 둔다. 발급 코드는 저장하지 않는다.
 *
 * localStorage 에 두는 것은 새로고침·탭 재시작에도 로그인을 유지하려는 것이다.
 * 운영진이 폰에서 5시간 교대 근무 중 앱을 몇 번이고 다시 연다. 토큰이 새면
 * 5시간 안에 저절로 죽고, 발급 코드는 여기 남지 않는다.
 */
const STORAGE_KEY = 'quinquatria-admin-token'
/** 발급 코드 이전의 목 로그인이 남긴 값. 읽지 않고 지운다 */
const LEGACY_KEY = 'quinquatria-admin-auth'

/** 사파리 프라이빗 모드처럼 localStorage 접근이 막힌 환경에서도 앱이 죽지 않게 한다 */
function readStored(): IssuedToken | null {
  try {
    localStorage.removeItem(LEGACY_KEY)
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<IssuedToken>
    if (typeof parsed.token !== 'string' || typeof parsed.expiresAt !== 'number') return null
    return parsed.expiresAt > Date.now() ? { token: parsed.token, expiresAt: parsed.expiresAt } : null
  } catch {
    return null
  }
}

function writeStored(value: IssuedToken | null): void {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // 저장에 실패해도 이번 세션은 진행시킨다. 새로고침하면 풀린다.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // 초기화 함수로 동기 계산한다. 첫 렌더에 값이 있어야 로그인 화면이 깜빡이지 않는다.
  const [session, setSession] = useState(readStored)

  // client 는 요청마다 토큰을 묻는다. 상태를 클로저로 잡으면 옛 값을 주므로 ref 로 넘긴다
  const tokenRef = useRef(session?.token ?? null)

  const logout = useCallback(() => {
    writeStored(null)
    setSession(null)
  }, [])

  // 자식의 첫 요청(useEffect)보다 먼저 꽂혀야 한다. layout effect 는 그보다 앞선다
  useLayoutEffect(() => {
    tokenRef.current = session?.token ?? null
  }, [session])

  useLayoutEffect(() => {
    configureClient({ authToken: () => tokenRef.current, onUnauthorized: logout })
  }, [logout])

  // 만료 시각에 맞춰 내린다. 그 전에 요청이 401 을 받으면 client 가 먼저 내린다
  useEffect(() => {
    if (!session) return
    const timer = setTimeout(logout, Math.max(session.expiresAt - Date.now(), 0))
    return () => clearTimeout(timer)
  }, [session, logout])

  const login = useCallback(async (code: string): Promise<LoginResult> => {
    let issued: IssuedToken | null
    try {
      issued = await issueToken(code)
    } catch {
      return 'unavailable'
    }
    if (!issued) return 'invalid'

    writeStored(issued)
    setSession(issued)
    return 'ok'
  }, [])

  const value = useMemo(
    () => ({ isAuthenticated: session !== null, login, logout }),
    [session, login, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
