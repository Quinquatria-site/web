import {
  IconCalendarLine,
  IconDaangnHouseLine,
  IconGearLine,
  IconMapLine,
  IconMegaphoneLine,
} from '@karrotmarket/react-monochrome-icon'
import { Outlet, useMatches } from 'react-router'
import { SnackbarProvider } from 'seed-design/ui/snackbar'
import { AppBar, BottomTabBar, type BottomTab } from '../ui'
import styles from './AppLayout.module.css'

const TABS: BottomTab[] = [
  { to: '/', label: '홈', icon: IconDaangnHouseLine },
  { to: '/places', label: '장소', icon: IconMapLine },
  { to: '/performances', label: '공연', icon: IconCalendarLine },
  { to: '/notices', label: '알림', icon: IconMegaphoneLine },
  { to: '/settings', label: '설정', icon: IconGearLine },
]

interface RouteHandle {
  title: string
  /** 뒤로가기 버튼 */
  back?: boolean
  /** 편집 화면처럼 몰입이 필요하면 탭바를 숨긴다 */
  hideTabs?: boolean
}

export function AppLayout() {
  const matches = useMatches()
  const handle = [...matches]
    .reverse()
    .map((match) => match.handle as RouteHandle | undefined)
    .find((value) => value?.title)

  return (
    <SnackbarProvider>
      <div className={styles.page}>
        <div className={styles.viewport}>
          <AppBar title={handle?.title ?? ''} back={handle?.back} />
          <main className={styles.body}>
            <Outlet />
          </main>
          {!handle?.hideTabs && <BottomTabBar tabs={TABS} />}
        </div>
      </div>
    </SnackbarProvider>
  )
}
