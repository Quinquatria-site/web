import { createContext, use } from 'react'

export interface AuthValue {
  isAuthenticated: boolean
  /** 맞으면 true. 호출부가 오류 표시를 정한다 */
  login: (password: string) => Promise<boolean>
  logout: () => void
}

export const AuthContext = createContext<AuthValue | null>(null)

export function useAuth() {
  const value = use(AuthContext)
  if (!value) throw new Error('useAuth 는 AuthProvider 안에서만 쓸 수 있다')
  return value
}
