import { HomeIcon, LostFoundIcon, MapIcon, NoticeIcon, TimelineIcon } from './icons'

export const PAGE_ITEMS = [
  { href: '/timeline', label: '타임라인', Icon: TimelineIcon },
  { href: '/map', label: '캠퍼스 지도', Icon: MapIcon },
  { href: '/notice', label: '공지사항', Icon: NoticeIcon },
  { href: '/lost-found', label: '분실물', Icon: LostFoundIcon },
] as const

export const HOME_ITEM = {
  href: '/',
  label: '홈',
  Icon: HomeIcon,
} as const
