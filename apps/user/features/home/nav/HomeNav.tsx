import { getLocale } from '@/shared/i18n/get-locale'
import { getMessages, type Messages } from '@/shared/i18n/messages'
import { localePath } from '@/shared/i18n/paths'
import { HomeNavCard, type HomeNavItem } from './HomeNavCard'
import goods from './images/goods.png'
import lostItems from './images/lost-items.png'
import map from './images/map.png'
import notices from './images/notices.png'
import timetable from './images/timetable.png'

// 그림마다 피그마에서 크기와 오른쪽 여백이 조금씩 달라 카드별로 옮겨 둔다
const ITEMS: (Omit<HomeNavItem, 'title' | 'description'> & {
  key: keyof Messages['home']['nav']
})[] = [
  {
    key: 'schedule',
    href: '/schedule',
    image: timetable,
    imageBox: 'top-0 right-[15px] h-[76px] w-[83px]',
  },
  {
    key: 'map',
    href: '/map',
    image: map,
    imageBox: 'top-0 right-[14px] h-[76px] w-[86px]',
  },
  {
    key: 'notices',
    href: '/notices',
    image: notices,
    imageBox: 'top-0 right-[5.3px] h-[76px] w-[93.7px]',
  },
  {
    key: 'lostItems',
    href: '/lost-items',
    image: lostItems,
    imageBox: 'top-0 right-[19px] h-[76px] w-[74px]',
  },
  {
    key: 'goods',
    href: '/goods',
    image: goods,
    imageBox: 'top-0 right-[13.3px] h-[76px] w-[83.7px]',
  },
]

/** 홈 랜딩 아래 바로가기 목록. 메인 탭 다섯 곳으로 가는 카드를 세로로 쌓는다 */
export async function HomeNav() {
  const locale = await getLocale()
  const { home } = getMessages(locale)
  return (
    <nav aria-label={home.navLabel} className="bg-secondary px-[22px] py-[22px]">
      <ul className="flex flex-col gap-4">
        {ITEMS.map(({ key, href, ...item }) => (
          <li key={key}>
            <HomeNavCard {...item} {...home.nav[key]} href={localePath(locale, href)} />
          </li>
        ))}
      </ul>
    </nav>
  )
}
