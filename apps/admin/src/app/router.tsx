import { createBrowserRouter } from 'react-router'
import { HomeRoute } from '../routes/HomeRoute'
import { LoginRoute } from '../routes/LoginRoute'
import { LostItemsRoute } from '../routes/LostItemsRoute'
import { MenuEditRoute } from '../routes/MenuEditRoute'
import { NoticeEditRoute } from '../routes/NoticeEditRoute'
import { NoticesRoute } from '../routes/NoticesRoute'
import { PerformanceEditRoute } from '../routes/PerformanceEditRoute'
import { PerformancesRoute } from '../routes/PerformancesRoute'
import { PlaceEditRoute } from '../routes/PlaceEditRoute'
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
          {
            path: 'places/new',
            element: <PlaceEditRoute />,
            handle: { title: '장소 추가', back: true, hideTabs: true },
          },
          {
            path: 'places/:id',
            element: <PlaceEditRoute />,
            handle: { title: '장소 편집', back: true, hideTabs: true },
          },
          {
            path: 'places/:id/menus/:menuId',
            element: <MenuEditRoute />,
            handle: { title: '메뉴', back: true, hideTabs: true },
          },
          { path: 'performances', element: <PerformancesRoute />, handle: { title: '공연' } },
          {
            path: 'performances/new',
            element: <PerformanceEditRoute />,
            handle: { title: '공연 추가', back: true, hideTabs: true },
          },
          {
            path: 'performances/:id',
            element: <PerformanceEditRoute />,
            handle: { title: '공연 편집', back: true, hideTabs: true },
          },
          { path: 'notices', element: <NoticesRoute />, handle: { title: '공지' } },
          {
            path: 'notices/new',
            element: <NoticeEditRoute />,
            handle: { title: '공지 작성', back: true, hideTabs: true },
          },
          {
            // 이 라우트는 두 상태를 갖는다 — 편집, 그리고 없는 공지 안내.
            // 상단바는 상태가 아니라 화면을 가리키므로 둘 다에서 맞는 이름을 쓴다
            path: 'notices/:id',
            element: <NoticeEditRoute />,
            handle: { title: '공지', back: true, hideTabs: true },
          },
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
