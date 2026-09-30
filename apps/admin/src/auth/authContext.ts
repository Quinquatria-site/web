import { createContext, use } from 'react'

/** ok: 들어간다. invalid: 코드가 틀렸다. unavailable: 서버에 닿지 못했다 */
export type LoginResult = 'ok' | 'invalid' | 'unavailable'

export interface AuthValue {
  isAuthenticated: boolean
  /** 토큰 만료 시각(epoch ms). 로그인 전이면 null */
  expiresAt: number | null
  /** 호출부가 결과에 따라 오류 표시를 정한다 */
  login: (code: string) => Promise<LoginResult>
  logout: () => void
}

export const AuthContext = createContext<AuthValue | null>(null)

export function useAuth() {
  const value = use(AuthContext)
  if (!value) throw new Error('useAuth 는 AuthProvider 안에서만 쓸 수 있다')
  return value
}
