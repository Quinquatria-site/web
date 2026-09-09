import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AuthContext } from './authContext'
import { verifyPassword } from './verifyPassword'

/** 비밀번호는 저장하지 않는다. 통과 여부만 남긴다. */
const STORAGE_KEY = 'quinquatria-admin-auth'

/** 사파리 프라이빗 모드처럼 localStorage 접근이 막힌 환경에서도 앱이 죽지 않게 한다 */
function readStored(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // 초기화 함수로 동기 계산한다. 첫 렌더에 값이 있어야 로그인 화면이 깜빡이지 않는다.
  const [isAuthenticated, setAuthenticated] = useState(readStored)

  const login = useCallback(async (password: string) => {
    const ok = await verifyPassword(password)
    if (!ok) return false

    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // 저장에 실패해도 이번 세션은 진행시킨다. 새로고침하면 풀린다.
    }
    setAuthenticated(true)
    return true
  }, [])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // 지우지 못해도 화면 상태는 내린다
    }
    setAuthenticated(false)
  }, [])

  const value = useMemo(
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated, login, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
