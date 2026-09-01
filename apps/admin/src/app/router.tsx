import { createBrowserRouter } from 'react-router'
import { HomeRoute } from '../routes/HomeRoute'
import { LostItemEditRoute } from '../routes/LostItemEditRoute'
import { MapRoute } from '../routes/MapRoute'
import { NoticeEditRoute } from '../routes/NoticeEditRoute'
import { NoticesRoute } from '../routes/NoticesRoute'
import { PerformanceEditRoute } from '../routes/PerformanceEditRoute'
import { PerformancesRoute } from '../routes/PerformancesRoute'
import { PlaceEditRoute } from '../routes/PlaceEditRoute'
import { PlacesRoute } from '../routes/PlacesRoute'
import { SettingsRoute } from '../routes/SettingsRoute'
import { AppLayout } from './AppLayout'

/** handle 의 title 을 AppBar 가 읽는다. 편집 화면은 탭바를 숨겨 몰입시킨다 */
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomeRoute />, handle: { title: '오늘의 운영' } },
      { path: 'places', element: <PlacesRoute />, handle: { title: '장소' } },
      { path: 'places/map', element: <MapRoute />, handle: { title: '지도', back: true } },
      {
        path: 'places/:kind/:id',
        element: <PlaceEditRoute />,
        handle: { title: '장소 편집', back: true, hideTabs: true },
      },
      { path: 'performances', element: <PerformancesRoute />, handle: { title: '공연' } },
      {
        path: 'performances/:id',
        element: <PerformanceEditRoute />,
        handle: { title: '공연 편집', back: true, hideTabs: true },
      },
      { path: 'notices', element: <NoticesRoute />, handle: { title: '알림' } },
      {
        path: 'notices/:id',
        element: <NoticeEditRoute />,
        handle: { title: '공지 작성', back: true, hideTabs: true },
      },
      {
        path: 'lost-items/:id',
        element: <LostItemEditRoute />,
        handle: { title: '분실물', back: true, hideTabs: true },
      },
      { path: 'settings', element: <SettingsRoute />, handle: { title: '설정' } },
    ],
  },
])
