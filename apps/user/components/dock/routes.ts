import { HOME_ITEM, PAGE_ITEMS } from '@/libs/routes'
import { HomeIcon, LostFoundIcon, MapIcon, NoticeIcon, TimelineIcon } from './icons'

// 아이콘은 dock 전용이다. 다른 화면은 같은 목록에 자기 아이콘을 얹는다.
const ICONS = {
  '/timeline': TimelineIcon,
  '/map': MapIcon,
  '/notice': NoticeIcon,
  '/lost-found': LostFoundIcon,
} as const

export const DOCK_ITEMS = PAGE_ITEMS.map((item) => ({ ...item, Icon: ICONS[item.href] }))

export const DOCK_HOME = { ...HOME_ITEM, Icon: HomeIcon }
