import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../auth/authContext'

/**
 * 미인증이면 /login 으로 보낸다. 가려던 경로를 state.from 에 실어
 * 로그인 후 그대로 돌아오게 한다.
 *
 * 이 가드는 화면 흐름이지 접근 통제가 아니다. 이유는 auth/verifyPassword.ts 참고.
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
