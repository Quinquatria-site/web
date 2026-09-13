import { createBrowserRouter } from 'react-router'
import { HomeRoute } from '../routes/HomeRoute'
import { LoginRoute } from '../routes/LoginRoute'
import { LostItemsRoute } from '../routes/LostItemsRoute'
import { NoticesRoute } from '../routes/NoticesRoute'
import { PerformancesRoute } from '../routes/PerformancesRoute'
import { PlacesMapRoute } from '../routes/PlacesMapRoute'
import { PlacesRoute } from '../routes/PlacesRoute'
import { SettingsRoute } from '../routes/SettingsRoute'
import { AppLayout } from './AppLayout'
import { RequireAuth } from './RequireAuth'

/**
 * /login 만 공개다. 나머지는 RequireAuth 아래에 둔다.
 * 새 화면은 반드시 그 children 에 넣어야 가드를 받는다.
 *
 * handle 은 AppLayout 이 읽는다.
 * - title   상단바 제목
 * - back    뒤로가기 버튼
 * - hideTabs 편집 화면처럼 몰입이 필요할 때 탭바를 숨긴다
 * - bare    상단바까지 숨긴다 (로그인)
 *
 * 편집 화면(/places/:id 등)은 각 도메인 작업에서 이 아래에 추가한다.
 * hideTabs: true, back: true 를 함께 준다.
 */
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: 'login', element: <LoginRoute />, handle: { title: '로그인', bare: true } },
      {
        element: <RequireAuth />,
        children: [
          { index: true, element: <HomeRoute />, handle: { title: '오늘의 운영' } },
          { path: 'places', element: <PlacesRoute />, handle: { title: '장소' } },
          {
            path: 'places/map',
            element: <PlacesMapRoute />,
            handle: { title: '지도', back: true },
          },
          { path: 'performances', element: <PerformancesRoute />, handle: { title: '공연' } },
          { path: 'notices', element: <NoticesRoute />, handle: { title: '공지' } },
          { path: 'lost-items', element: <LostItemsRoute />, handle: { title: '분실물' } },
          {
            path: 'settings',
            element: <SettingsRoute />,
            handle: { title: '설정', back: true, hideTabs: true },
          },
        ],
      },
    ],
  },
])
