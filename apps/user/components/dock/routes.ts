import { HomeIcon, PAGE_ICONS } from '@/components/icons'
import { HOME_ITEM, PAGE_ITEMS } from '@/libs/routes'

export const DOCK_ITEMS = PAGE_ITEMS.map((item) => ({ ...item, Icon: PAGE_ICONS[item.href] }))

export const DOCK_HOME = { ...HOME_ITEM, Icon: HomeIcon }
