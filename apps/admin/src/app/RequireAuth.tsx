import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../auth/authContext'

/**
 * 미인증이면 /login 으로 보낸다. 가려던 경로를 state.from 에 실어
 * 로그인 후 그대로 돌아오게 한다.
 *
 * 실제 접근 통제는 서버가 한다 — 모든 Backoffice API 가 Bearer 토큰을 요구하고,
 * 토큰이 죽으면 client 가 401 을 받아 로그아웃시킨다. 이 가드는 화면 흐름이다.
 */
export function RequireAuth() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    // replace 로 둬야 뒤로가기가 튕긴 경로로 되돌아가지 않는다
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  return <Outlet />
}
