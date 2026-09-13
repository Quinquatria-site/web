import {
  IconBoxFlapLine,
  IconCalendarLine,
  IconGearLine,
  IconHouseLine,
  IconMapLine,
  IconMegaphoneLine,
} from '@karrotmarket/react-monochrome-icon'
import { Link, Outlet, useMatches } from 'react-router'
import { AppBar, BottomTabBar, type BottomTab } from '../ui'
import styles from './AppLayout.module.css'

/** 관리 대상 네 도메인에 현황판을 더한 다섯. 폰 탭바는 이 이상 늘리지 않는다. */
const TABS: BottomTab[] = [
  { to: '/', label: '홈', icon: IconHouseLine },
  { to: '/places', label: '장소', icon: IconMapLine },
  { to: '/performances', label: '공연', icon: IconCalendarLine },
  { to: '/notices', label: '공지', icon: IconMegaphoneLine },
  { to: '/lost-items', label: '분실물', icon: IconBoxFlapLine },
]

export interface RouteHandle {
  title: string
  /** 뒤로가기 버튼 */
  back?: boolean
  /** 편집 화면처럼 몰입이 필요하면 탭바를 숨긴다 */
  hideTabs?: boolean
  /** 로그인 화면은 상단바도 숨긴다 */
  bare?: boolean
}

/**
 * 데스크톱에서도 폰 폭으로 고정하는 셸.
 * 상단바 제목과 탭바 노출 여부는 라우트의 handle 이 정한다.
 */
export function AppLayout() {
  const matches = useMatches()
  const handle = [...matches]
    .reverse()
    .map((match) => match.handle as RouteHandle | undefined)
    .find((value) => value?.title)

  // 설정은 탭을 차지할 만큼 자주 쓰지 않아 상단바 우측에 둔다
  const settingsAction = (
    <Link to="/settings" className={styles.action} aria-label="설정">
      <IconGearLine width={24} height={24} />
    </Link>
  )

  const bare = handle?.bare ?? false

  return (
    <div className={styles.page}>
      <div className={styles.viewport}>
        {!bare && (
          <AppBar
            title={handle?.title ?? ''}
            back={handle?.back}
            action={handle?.hideTabs ? undefined : settingsAction}
          />
        )}
        {/* bare 여부와 무관하게 같은 스크롤 컨테이너를 쓴다.
            로그인 화면도 작은 기기에서는 스크롤이 필요하다 */}
        <main className={styles.body}>
          <Outlet />
        </main>
        {!bare && !handle?.hideTabs && <BottomTabBar tabs={TABS} />}
      </div>
    </div>
  )
}
