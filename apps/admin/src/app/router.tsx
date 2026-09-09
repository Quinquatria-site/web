import { createBrowserRouter } from 'react-router'
import { HomeRoute } from '../routes/HomeRoute'
import { LoginRoute } from '../routes/LoginRoute'
import { AppLayout } from './AppLayout'
import { RequireAuth } from './RequireAuth'

/**
 * /login 만 공개다. 나머지는 RequireAuth 아래에 둔다.
 * 새 화면은 RequireAuth 의 children 에 넣어야 가드를 받는다.
 *
 * handle 의 title 은 나중에 AppBar 가 읽는다.
 */
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: 'login', element: <LoginRoute />, handle: { title: '로그인' } },
      {
        element: <RequireAuth />,
        children: [{ index: true, element: <HomeRoute />, handle: { title: '운영 홈' } }],
      },
    ],
  },
])
